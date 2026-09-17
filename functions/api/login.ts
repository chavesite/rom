import { getStoreData } from '../_lib/data';

interface Env {
  STORE_KV: any;
}

// POST /api/login -> { password } => { ok: true|false }
export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: { password?: string } = {};
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await getStoreData(context.env.STORE_KV);

  if (body.password === data.settings.adminPassword) {
    return Response.json({ ok: true });
  }

  return new Response(JSON.stringify({ ok: false }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
};
