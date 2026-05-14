import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Content-Type': 'application/json',
};

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const BASE = Deno.env.get('UNIPILE_BASE_URL')!;
const KEY = Deno.env.get('UNIPILE_API_KEY')!;
const ACCOUNT_ID = Deno.env.get('UNIPILE_ACCOUNT_ID')!;
const START_TIME = Date.now();
const TIMEOUT_MS = 55_000; // Stop gracefully before 60s edge function limit

function isTimedOut(): boolean {
  return Date.now() - START_TIME > TIMEOUT_MS;
}

function extractIdentifier(url: string): string | null {
  try {
    const parts = url.split('/').filter(Boolean);
    const idx = parts.indexOf('in');
    if (idx === -1) return null;
    return parts[idx + 1]?.replace(/\?.*/, '') || null;
  } catch {
    return null;
  }
}

/** Resolve provider_ids for all accepted leads that don't have one yet */
async function resolveProviderIds(
  leads: Array<{ id: string; linkedin_url: string | null; name: string | null }>,
  existingProfiles: Array<{ lead_id: string; provider_id: string | null }> | null
): Promise<Map<string, string>> {
  const providerIdToLeadId = new Map<string, string>();
  const knownLeadIds = new Set<string>();

  for (const p of existingProfiles || []) {
    if (p.provider_id) {
      providerIdToLeadId.set(p.provider_id, p.lead_id);
    }
    knownLeadIds.add(p.lead_id);
  }

  const leadsNeedingLookup = leads.filter(l => !knownLeadIds.has(l.id));
  console.log(`Provider IDs: ${providerIdToLeadId.size} cached, ${leadsNeedingLookup.length} need lookup`);

  // Resolve ALL remaining leads (no artificial limit)
  for (const lead of leadsNeedingLookup) {
    if (isTimedOut()) {
      console.log('Timeout approaching during provider_id resolution, stopping');
      break;
    }

    const identifier = lead.linkedin_url ? extractIdentifier(lead.linkedin_url) : null;
    if (!identifier) continue;

    try {
      const res = await fetch(`${BASE}/api/v1/users/${identifier}?account_id=${ACCOUNT_ID}`, {
        headers: { 'X-API-KEY': KEY, 'accept': 'application/json' },
      });
      if (!res.ok) { await res.text(); continue; }
      const profile = await res.json();
      const providerId = profile.provider_id || profile.id;
      if (providerId) {
        providerIdToLeadId.set(providerId, lead.id);
        await supabase.from('linkedin_profiles').upsert({
          lead_id: lead.id,
          provider_id: providerId,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          headline: profile.headline || '',
          profile_pic_url: profile.profile_picture_url || profile.picture_url || '',
          public_identifier: identifier,
          fetched_at: new Date().toISOString(),
        }, { onConflict: 'lead_id' });
      }
      await new Promise(r => setTimeout(r, 300));
    } catch { continue; }
  }

  return providerIdToLeadId;
}

/** Build a name-to-leadId map for fallback matching */
function buildNameMap(leads: Array<{ id: string; name: string | null }>): Map<string, string> {
  const map = new Map<string, string>();
  for (const lead of leads) {
    if (lead.name) {
      map.set(lead.name.toLowerCase().trim(), lead.id);
    }
  }
  return map;
}

/** Try to match a chat to a lead using provider_id first, then fallback to name */
function matchChat(
  chat: any,
  providerIdToLeadId: Map<string, string>,
  nameToLeadId: Map<string, string>
): string | null {
  // Strategy 1: Match by attendee_provider_id (top-level)
  if (chat.attendee_provider_id) {
    const match = providerIdToLeadId.get(chat.attendee_provider_id);
    if (match) return match;
  }

  // Strategy 2: Match by attendees array provider_id
  if (Array.isArray(chat.attendees)) {
    for (const attendee of chat.attendees) {
      if (attendee.provider_id) {
        const match = providerIdToLeadId.get(attendee.provider_id);
        if (match) return match;
      }
    }
  }

  // Strategy 3: Fallback match by attendee display name
  const displayName = chat.attendee_display_name || chat.name;
  if (displayName) {
    const match = nameToLeadId.get(displayName.toLowerCase().trim());
    if (match) return match;
  }

  // Strategy 4: Match by attendees array name
  if (Array.isArray(chat.attendees)) {
    for (const attendee of chat.attendees) {
      const name = attendee.display_name || attendee.name;
      if (name) {
        const match = nameToLeadId.get(name.toLowerCase().trim());
        if (match) return match;
      }
    }
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get accepted leads
    const { data: acceptedRows } = await supabase
      .from('connection_requests')
      .select('lead_id')
      .eq('status', 'accepted');

    if (!acceptedRows?.length) {
      return new Response(JSON.stringify({ message: 'No accepted leads', replies_found: 0 }), { headers: corsHeaders });
    }

    const acceptedLeadIds = acceptedRows.map(r => r.lead_id);
    const { data: leads } = await supabase
      .from('leads')
      .select('id, linkedin_url, name')
      .in('id', acceptedLeadIds);

    if (!leads?.length) {
      return new Response(JSON.stringify({ message: 'No leads found', replies_found: 0 }), { headers: corsHeaders });
    }

    console.log(`Detect-replies: ${leads.length} accepted leads to check`);

    // Resolve provider_ids
    const { data: existingProfiles } = await supabase
      .from('linkedin_profiles')
      .select('lead_id, provider_id')
      .in('lead_id', acceptedLeadIds);

    const providerIdToLeadId = await resolveProviderIds(leads, existingProfiles);
    const nameToLeadId = buildNameMap(leads);
    console.log(`Matching maps: ${providerIdToLeadId.size} by provider_id, ${nameToLeadId.size} by name`);

    // Fetch chats and match
    const after = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days back
    let chatCursor: string | null = null;
    let totalChats = 0;
    let repliesFound = 0;
    let chatsMatched = 0;
    let messagesStored = 0;
    let timedOut = false;

    do {
      if (isTimedOut()) { timedOut = true; break; }

      const chatUrl = new URL(`${BASE}/api/v1/chats`);
      chatUrl.searchParams.set('account_id', ACCOUNT_ID);
      chatUrl.searchParams.set('limit', '100');
      chatUrl.searchParams.set('after', after);
      if (chatCursor) chatUrl.searchParams.set('cursor', chatCursor);

      const chatsRes = await fetch(chatUrl.toString(), {
        headers: { 'X-API-KEY': KEY, 'accept': 'application/json' },
      });

      if (!chatsRes.ok) {
        console.error(`Chats API error: ${chatsRes.status} ${await chatsRes.text()}`);
        break;
      }

      const chatsData = await chatsRes.json();
      const chats = chatsData.items || [];
      totalChats += chats.length;

      for (const chat of chats) {
        if (isTimedOut()) { timedOut = true; break; }

        const matchedLeadId = matchChat(chat, providerIdToLeadId, nameToLeadId);
        if (!matchedLeadId) continue;
        chatsMatched++;

        // Fetch messages for this chat
        try {
          const msgsRes = await fetch(
            `${BASE}/api/v1/chats/${chat.id}/messages?account_id=${ACCOUNT_ID}&limit=100`,
            { headers: { 'X-API-KEY': KEY, 'accept': 'application/json' } }
          );

          if (!msgsRes.ok) { await msgsRes.text(); continue; }
          const msgsData = await msgsRes.json();
          const messages = msgsData.items || [];

          for (const msg of messages) {
            const isReply = msg.is_sender === 0 || msg.is_sender === false;
            const messageText = msg.text || msg.body || '';
            if (!messageText) continue;

            const receivedAt = msg.timestamp || msg.created_at || new Date().toISOString();
            // Always generate a provider_message_id for dedup
            const providerMessageId = msg.id || `synth_${matchedLeadId}_${chat.id}_${Buffer.from(messageText.slice(0, 50) + receivedAt).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)}`;

            const { error: upsertErr } = await supabase.from('messages').upsert({
              lead_id: matchedLeadId,
              chat_id: chat.id,
              message_text: messageText,
              sender_type: isReply ? 'them' : 'us',
              is_reply: isReply,
              received_at: receivedAt,
              provider_message_id: providerMessageId,
            }, {
              onConflict: 'lead_id,chat_id,provider_message_id',
            });

            if (upsertErr) {
              console.error(`Upsert error for chat ${chat.id}:`, upsertErr.message);
            } else {
              messagesStored++;
              if (isReply) repliesFound++;
            }
          }
        } catch (msgErr) {
          console.error(`Error fetching messages for chat ${chat.id}:`, msgErr);
          continue;
        }

        await new Promise(r => setTimeout(r, 100));
      }

      chatCursor = chatsData.cursor || null;
      console.log(`Chat page: ${chats.length} chats, ${chatsMatched} matched so far`);
    } while (chatCursor && !timedOut);

    const result = {
      accepted_leads: leads.length,
      provider_ids_resolved: providerIdToLeadId.size,
      chats_scanned: totalChats,
      chats_matched: chatsMatched,
      messages_stored: messagesStored,
      replies_found: repliesFound,
      timed_out: timedOut,
    };
    console.log(`Done:`, JSON.stringify(result));
    return new Response(JSON.stringify(result), { headers: corsHeaders });
  } catch (err) {
    console.error('detect-replies error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
