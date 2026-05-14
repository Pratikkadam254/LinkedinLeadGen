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

function extractIdentifier(url: string): string | null {
  try {
    const parts = url.split('/').filter(Boolean);
    const idx = parts.indexOf('in');
    if (idx === -1) return null;
    return parts[idx + 1]?.replace(/\?.*/, '')?.toLowerCase() || null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get all SENT leads with linkedin_urls
    const { data: sentLeads } = await supabase
      .from('leads')
      .select('id, linkedin_url, name')
      .eq('status', 'SENT')
      .not('linkedin_url', 'is', null)
      .not('linkedin_url', 'eq', '');

    if (!sentLeads || sentLeads.length === 0) {
      return new Response(JSON.stringify({ message: 'No sent leads to check', updated: 0 }), { headers: corsHeaders });
    }

    // Build lookup maps directly from leads (no dependency on linkedin_profiles)
    const byIdentifier = new Map<string, string>();
    for (const lead of sentLeads) {
      const identifier = extractIdentifier(lead.linkedin_url);
      if (identifier) {
        byIdentifier.set(identifier, lead.id);
      }
    }

    // Also check linkedin_profiles if any exist (for provider_id matching)
    const { data: profiles } = await supabase
      .from('linkedin_profiles')
      .select('lead_id, provider_id')
      .in('lead_id', sentLeads.map(l => l.id));

    const byProviderId = new Map<string, string>();
    if (profiles) {
      for (const p of profiles) {
        if (p.provider_id) byProviderId.set(p.provider_id, p.lead_id);
      }
    }

    console.log(`Checking connections for ${sentLeads.length} SENT leads: ${byIdentifier.size} by identifier, ${byProviderId.size} by provider_id`);

    let cursor: string | null = null;
    let updated = 0;
    let totalRelations = 0;

    do {
      const url = new URL(`${BASE}/api/v1/users/relations`);
      url.searchParams.set('account_id', ACCOUNT_ID);
      url.searchParams.set('limit', '100');
      if (cursor) url.searchParams.set('cursor', cursor);

      const res = await fetch(url.toString(), {
        headers: { 'X-API-KEY': KEY, 'accept': 'application/json' },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Unipile API error: ${res.status} ${errText}`);
        break;
      }

      const data = await res.json();
      const items = data.items || [];
      totalRelations += items.length;

      const upserts: any[] = [];
      for (const relation of items) {
        // Match by public_identifier first, then by provider_id/member_id
        const relationIdentifier = relation.public_identifier?.toLowerCase();
        const leadId =
          (relationIdentifier && byIdentifier.get(relationIdentifier)) ||
          byProviderId.get(relation.member_id) ||
          byProviderId.get(relation.provider_id);

        if (leadId) {
          const acceptedAt = typeof relation.created_at === 'number'
            ? new Date(relation.created_at).toISOString()
            : relation.created_at || new Date().toISOString();

          upserts.push({
            lead_id: leadId,
            status: 'accepted',
            accepted_at: acceptedAt,
            checked_at: new Date().toISOString(),
          });
        }
      }

      if (upserts.length > 0) {
        const { error } = await supabase
          .from('connection_requests')
          .upsert(upserts, { onConflict: 'lead_id' });
        if (error) console.error('Upsert error:', error.message);
        else updated += upserts.length;
      }

      cursor = data.cursor || null;
      console.log(`Page: ${items.length} relations, ${upserts.length} matched. Total so far: ${totalRelations}`);
    } while (cursor);

    // Also update lead status awareness - log summary
    console.log(`Done: ${totalRelations} total relations scanned, ${updated} accepted connections found out of ${sentLeads.length} SENT leads`);
    return new Response(JSON.stringify({ 
      sent_leads: sentLeads.length,
      relations_scanned: totalRelations, 
      accepted_found: updated 
    }), { headers: corsHeaders });
  } catch (err) {
    console.error('check-connections error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
