import { defineMiddleware } from 'astro:middleware';

const users = new Map([
  ['admin', 'pVnDjtyvcZ'],
  ['cj', 'ZxuaG1PxBuy66'],
  ['api', 'ZNxBPmhjxGxB']
]);

const devkeysToken = 'f0194e8e0d1a8c6ccfd131f7';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  if (url.pathname === '/api/exness' || url.pathname.startsWith('/links')) {
    return await next();
  }

  const auth = context.request.headers.get('Authorization');
  if (url.pathname === '/api/af/devkeys') {
    const token = /^(?:Bearer|Bearear) (.+)$/i.exec(auth || '')?.[1];
    if (token === devkeysToken) {
      return await next();
    }
  }

  const base64 = auth && /Basic (.+)/i.exec(auth)?.[1] || '';
  const [_, user, password] = /(.+):(.+)/.exec(atob(base64)) || [];
  if (!user || !password || users.get(user) !== password) {
    return Response.json({ ok: false, code: 401, reason: 'Unauthorized' }, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Restricted Area"'
      }
    });
  }

  return await next();
});
