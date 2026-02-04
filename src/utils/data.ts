
export function parseProxy(proxy: string) {
  const match = proxy.match(/^(https?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    return { url: proxy };
  }
  const [, protocol, username, password, host] = match;
  return { username, password, url: `${protocol}${host}` };
}

export function dbToTask(task: Record<string, unknown>, proxyAsObject: boolean = false): any {
  return {
    ...task,
    disabled: !!task.disabled,
    countries: typeof task.countries === 'string' ? JSON.parse(task.countries as string) : [],
    proxy: proxyAsObject ? parseProxy(task.proxy as string) : (task.proxy as string),
    send_page_view: !!task.send_page_view,
    use_page_view: !!task.use_page_view,
  };
}

function tidyObject(obj: Record<string, unknown>) {
  for (const key of Object.keys(obj)) {
    if (!obj[key]) delete obj[key];
  }

  return obj;
}

export function dbToClicks(items: Record<string, unknown>[], tidy: boolean = false): any[] {
  tidy &&items.forEach(item => {
    delete item.id;
    delete item.task_id;
    delete item.disabled;

    tidyObject(item);
  });
 
  return items.map(item => ({
    ...item,
    disabled: !!item.disabled,
    use_impact_return: !!item.use_impact_return,
    use_impact_click: !!item.use_impact_click,
    custom_params: tidy ?
      tidyObject(JSON.parse(item.custom_params as string)) :
      JSON.parse(item.custom_params as string)
  }));
}