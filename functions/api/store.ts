import { getStoreData, saveStoreData, stripPassword, Product, Settings } from '../_lib/data';

interface Env {
  STORE_KV: any;
}

// GET /api/store -> dados públicos da loja (sem a senha do admin)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const data = await getStoreData(context.env.STORE_KV);
  return Response.json({
    settings: stripPassword(data.settings),
    products: data.products,
  });
};

// POST /api/store -> atualiza settings e/ou products.
// Exige o header "x-admin-password" com a senha atual do painel.
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const data = await getStoreData(context.env.STORE_KV);
  const authHeader = context.request.headers.get('x-admin-password') || '';

  if (authHeader !== data.settings.adminPassword) {
    return new Response(JSON.stringify({ error: 'Senha incorreta.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { settings?: Partial<Settings>; products?: Product[] } = {};
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Corpo inválido.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const updated = {
    settings: { ...data.settings, ...(body.settings || {}) },
    products: body.products !== undefined ? body.products : data.products,
  };

  await saveStoreData(context.env.STORE_KV, updated);

  return Response.json({
    settings: stripPassword(updated.settings),
    products: updated.products,
  });
};
