import type { APIRoute } from 'astro';

function parseProxy(proxy: string) {
  const match = proxy.match(/^(https?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    return { url: proxy };
  }
  const [, protocol, username, password, host] = match;
  return { username, password, url: `${protocol}${host}` };
}

export const GET: APIRoute = async ({ url, locals: { runtime: { env: { PB_DB } } } }) => {
  const actived = url.searchParams.get('actived');

  const sql = 'SELECT * FROM tasks';
  const tasks = await PB_DB.prepare(sql).all();

  if (actived === 'true') {
    const sql = 'SELECT * FROM task_items WHERE disabled = 0';
    const activeItems = await PB_DB.prepare(sql).all();

    const results = tasks.results
      .filter(task => !task.disabled && task.countries !== '[]')
      .map(task => {
        delete task.icon_url;
        delete task.disabled;
        return { ...task,
          countries: JSON.parse(task.countries as string).join(','),
          proxy: parseProxy(task.proxy as string),
          send_page_view: !!task.send_page_view,
          use_page_view: !!task.use_page_view,
          clicks: activeItems.results
            .filter(item => item.task_id === task.app_id)
            .map(item => {
              delete item.id;
              delete item.task_id;
              delete item.disabled;

              item.use_impact_return = !!item.use_impact_return;
              item.use_impact_click = !!item.use_impact_click;

              for (const key of Object.keys(item)) {
                if (!item[key]) delete item[key];
              }

              const cp = JSON.parse(item.custom_params as string);
              if (Object.keys(cp).every(key => !cp[key])) {
                delete item.custom_params;
              } else {
                item.custom_params = cp;
              }

              return item;
            })
        };
      });
    return Response.json(results);
  } else {
    return Response.json(tasks.results);
  }
}