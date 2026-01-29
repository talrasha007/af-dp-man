import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, locals: { runtime: { env: { PB_DB } } } }) => {
  const taskSql = 'SELECT * FROM tasks WHERE app_id = ?';
  const task = await PB_DB.prepare(taskSql).bind(params.id).first();
  if (!task) {
    return new Response('Task not found', { status: 404 });
  }

  const itemsSql = 'SELECT * FROM task_items WHERE task_id = ?';
  const taskItems = await PB_DB.prepare(itemsSql).bind(params.id).all();
  return Response.json({ task, items: taskItems.results });
};

export const PUT: APIRoute = async ({ params, request, locals: { runtime: { env: { PB_DB } } } }) => {
  const task = await request.json<PB_DB.Task>();
  const items = task.clicks ?? [];

  const taskId = params.id ?? task.app_id;
  if (!taskId) {
    return new Response('Missing task id', { status: 400 });
  }
  if (task.app_id && task.app_id !== taskId) {
    return new Response('Task id mismatch', { status: 400 });
  }

  if (items.length === 0) {
    task.disabled = true;
  }

  const countriesValue =
    typeof task.countries === 'string' ? task.countries : JSON.stringify(task.countries ?? []);

  const upsertTaskSql = `
    INSERT INTO tasks (
      app_id,
      app_name,
      icon_url,
      disabled,
      countries,
      proxy,
      send_page_view,
      use_page_view,
      page_click,
      page_click_rate,
      prefix,
      click_duration,
      click_ratio
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(app_id) DO UPDATE SET
      app_name = excluded.app_name,
      icon_url = excluded.icon_url,
      disabled = excluded.disabled,
      countries = excluded.countries,
      proxy = excluded.proxy,
      send_page_view = excluded.send_page_view,
      use_page_view = excluded.use_page_view,
      page_click = excluded.page_click,
      page_click_rate = excluded.page_click_rate,
      prefix = excluded.prefix,
      click_duration = excluded.click_duration,
      click_ratio = excluded.click_ratio
  `;

  await PB_DB.prepare(upsertTaskSql)
    .bind(
      taskId,
      task.app_name ?? '',
      task.icon_url ?? '',
      task.disabled ?? false,
      countriesValue,
      task.proxy ?? '',
      task.send_page_view ?? false,
      task.use_page_view ?? false,
      task.page_click ?? '',
      task.page_click_rate ?? 0,
      task.prefix ?? '',
      task.click_duration ?? 0,
      task.click_ratio ?? 0
    )
    .run();

  if (items.length === 0) {
    await PB_DB.prepare('DELETE FROM task_items WHERE task_id = ?').bind(taskId).run();
    return Response.json({ ok: true });
  }

  const existingIds = items.map((item) => item.id).filter(Boolean);
  if (existingIds.length === 0) {
    await PB_DB.prepare('DELETE FROM task_items WHERE task_id = ?').bind(taskId).run();
    return Response.json({ ok: true });
  }

  const deleteSql = `DELETE FROM task_items WHERE task_id = ? AND id NOT IN (${existingIds
    .map(() => '?')
    .join(', ')})`;
  await PB_DB.prepare(deleteSql).bind(taskId, ...existingIds).run();

  const upsertItemSql = `
    INSERT INTO task_items (
      id,
      disabled,
      task_id,
      deep_link_value,
      custom_params,
      weight,
      page_url,
      impact_url,
      redirect_until,
      item_name,
      use_impact_return,
      use_impact_click
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      disabled = excluded.disabled,
      task_id = excluded.task_id,
      deep_link_value = excluded.deep_link_value,
      custom_params = excluded.custom_params,
      weight = excluded.weight,
      page_url = excluded.page_url,
      impact_url = excluded.impact_url,
      redirect_until = excluded.redirect_until,
      item_name = excluded.item_name,
      use_impact_return = excluded.use_impact_return,
      use_impact_click = excluded.use_impact_click
  `;

  for (const item of items) {
    if (!item.id) continue;
    const customParamsValue =
      typeof item.custom_params === 'string'
        ? item.custom_params
        : JSON.stringify(item.custom_params ?? {});

    await PB_DB.prepare(upsertItemSql)
      .bind(
        item.id,
        item.disabled ?? false,
        taskId,
        item.deep_link_value ?? '',
        customParamsValue,
        item.weight ?? 0,
        item.page_url ?? '',
        item.impact_url ?? '',
        item.redirect_until ?? '',
        item.item_name ?? '',
        item.use_impact_return ?? false,
        item.use_impact_click ?? false
      )
      .run();
  }

  return Response.json({ ok: true });
};
