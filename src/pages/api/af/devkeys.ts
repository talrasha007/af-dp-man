import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals: { runtime: { env: { PB_DB } } } }) => {
  const devkeys = await PB_DB.prepare('SELECT app_id, dev_key FROM apps').all();
  return Response.json(devkeys.results);
}
