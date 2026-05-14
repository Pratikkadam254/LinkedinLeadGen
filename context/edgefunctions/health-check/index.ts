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
    const res = await fetch(`${BASE}/api/v1/accounts/${ACCOUNT_ID}`, {
      headers: { 'X-API-KEY': KEY, 'accept': 'application/json' }
    });
    if (!res.ok) {
      const body = await res.text();
      await supabase.from('account_health').insert({
        account_id: ACCOUNT_ID, status: 'ERROR', is_healthy: false,
        error_detail: `API returned ${res.status}: ${body.substring(0, 200)}`, checked_at: new Date().toISOString()
      });
      return new Response(JSON.stringify({ healthy: false, error: body.substring(0, 200) }), { headers: corsHeaders });
    }

    const account = await res.json();
    const sources = account.sources || [];
    const sourceStatuses = sources.map((s: { status: string }) => s.status);
    const allOK = sources.length > 0 && sourceStatuses.every((s: string) => s === 'OK');
    const effectiveStatus = sources.length > 0 ? sourceStatuses.join(', ') : 'NO_SOURCES';

    await supabase.from('account_health').insert({
      account_id:   ACCOUNT_ID,
      account_type: account.type || 'LINKEDIN',
      status:       effectiveStatus,
      is_healthy:   allOK,
      error_detail: !allOK ? `Source statuses: ${effectiveStatus}` : null,
      checked_at:   new Date().toISOString(),
    });

    return new Response(JSON.stringify({
      account_id: ACCOUNT_ID,
      name: account.name,
      status: effectiveStatus,
      healthy: allOK,
    }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
