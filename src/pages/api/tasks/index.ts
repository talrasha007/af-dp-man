import type { APIRoute } from 'astro';

import { dbToTask, dbToClicks } from '../../../utils/data';

export const GET: APIRoute = async ({ url, locals: { runtime: { env: { PB_DB } } } }) => {
  const actived = url.searchParams.get('actived');

  const sql = 'SELECT * FROM tasks';
  const tasks = await PB_DB.prepare(sql).all();

  if (actived === 'true') {
    const sql = 'SELECT * FROM task_items WHERE disabled = 0';
    const activeItems = await PB_DB.prepare(sql).all();

    const results = tasks.results
      .filter(task => !task.disabled && task.countries !== '[]' && task.click_duration && task.click_ratio)
      .map(task => {
        delete task.icon_url;
        delete task.disabled;
        return {
          ...dbToTask(task, true),
          clicks: dbToClicks(activeItems.results.filter(item => item.task_id === task.app_id && !item.disabled), true)
        };
      });
    return Response.json(results);
  } else {
    return Response.json(tasks.results);
  }
}