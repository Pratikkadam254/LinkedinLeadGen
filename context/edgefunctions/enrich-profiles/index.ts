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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data: leads } = await supabase.from('leads').select('id, linkedin_url')
      .not('linkedin_url', 'is', null).not('linkedin_url', 'eq', '').not('linkedin_url', 'like', '%NOT FOUND%');
    const { data: existing } = await supabase.from('linkedin_profiles').select('lead_id');
    const done = new Set((existing || []).map((e: { lead_id: string }) => e.lead_id));
    const todo = (leads || []).filter((l: { id: string }) => !done.has(l.id)).slice(0, 20);

    let enriched = 0;
    for (const lead of todo) {
      try {
        const parts = (lead.linkedin_url as string).split('/').filter(Boolean);
        const idx = parts.indexOf('in');
        if (idx === -1) continue;
        const identifier = parts[idx + 1]?.replace(/\?.*/, '');
        if (!identifier) continue;

        const res = await fetch(`${BASE}/api/v1/users/${identifier}?account_id=${ACCOUNT_ID}`, {
          headers: { 'X-API-KEY': KEY, 'accept': 'application/json' }
        });
        if (!res.ok) { await res.text(); continue; }
        const p = await res.json();

        await supabase.from('linkedin_profiles').upsert({
          lead_id:          lead.id,
          provider_id:      p.provider_id || p.id || '',
          first_name:       p.first_name || '',
          last_name:        p.last_name || '',
          full_name:        `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          headline:         p.headline || '',
          profile_pic_url:  p.profile_picture_url || p.picture_url || '',
          public_identifier: identifier,
          fetched_at:       new Date().toISOString(),
        }, { onConflict: 'lead_id' });

        enriched++;
        await new Promise(r => setTimeout(r, 2000));
      } catch { continue; }
    }

    return new Response(JSON.stringify({ enriched, total_todo: todo.length }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
