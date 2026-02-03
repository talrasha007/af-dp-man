import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals: { runtime: { env: { PB_DB } } } }) => {
  const apps = await PB_DB.prepare('SELECT app_id, app_name FROM apps').all();
  return Response.json(apps.results);
}