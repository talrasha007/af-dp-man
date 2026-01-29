import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals: { runtime: { env: { PB_DB } } } }) => {
  const sql = 'SELECT * FROM tasks';
  const tasks = await PB_DB.prepare(sql).all();
  return Response.json(tasks.results);
}