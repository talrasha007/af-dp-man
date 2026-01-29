import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals: { runtime: { env: { PB_DB } } } }) => {
  const taskSql = 'SELECT * FROM tasks WHERE id = ?';
  const task = await PB_DB.prepare(taskSql).bind(params.id).first();
  if (!task) {
    return new Response('Task not found', { status: 404 });
  }

  const itemsSql = 'SELECT * FROM task_items WHERE task_id = ?';
  const taskItems = await PB_DB.prepare(itemsSql).bind(params.id).all();
  return Response.json({ task, items: taskItems.results });
}