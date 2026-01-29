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
        };
      });
    return Response.json(results);
  } else {
    return Response.json(tasks.results);
  }
}