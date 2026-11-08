// Supabase Edge Function: Сократ → Google Gemini
// Секрет: GEMINI_API_KEY (Dashboard → Edge Functions → Secrets)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Msg = { role: string; content: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY не задан' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Опционально: только для залогиненных
    const authHeader = req.headers.get('Authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY');
    if (authHeader && supabaseUrl && supabaseAnon) {
      const userClient = createClient(supabaseUrl, supabaseAnon, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    const body = await req.json();
    const system = String(body.system ?? '');
    const userMessage = String(body.userMessage ?? '');
    const contextNote = body.contextNote ? String(body.contextNote) : undefined;
    const history = Array.isArray(body.history) ? (body.history as Msg[]) : [];

    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const m of history) {
      if (m.role === 'system') continue;
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(m.content ?? '') }],
      });
    }
    const extra = contextNote ? `\n\nКонтекст урока: ${contextNote}` : '';
    contents.push({ role: 'user', parts: [{ text: `${userMessage}${extra}` }] });

    const payload = {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.55, maxOutputTokens: 550 },
    };

    let text = '';
    let lastErr = 'Gemini недоступен';
    for (const model of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiKey,
        },
        body: JSON.stringify(payload),
      });
      if (!geminiRes.ok) {
        lastErr = await geminiRes.text();
        if ([401, 403].includes(geminiRes.status)) break;
        continue;
      }
      const data = await geminiRes.json();
      text =
        data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('')?.trim() ??
        '';
      if (text) break;
    }

    if (!text) {
      return new Response(JSON.stringify({ error: lastErr.slice(0, 300) }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
