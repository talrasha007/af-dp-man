import crypto from 'crypto';
import type { APIRoute } from 'astro';

function calcAfSig(devKey: string, afTimestamp: string) {
  console.log(devKey, afTimestamp);
  return crypto.createHmac('sha256', devKey).update(afTimestamp + devKey, 'utf8').digest('hex');
}

export const GET: APIRoute = async ({ url, locals: { runtime: { env: { PB_DB } } } }) => {
  const { app, gaid, idfa, ip, model, version } = Object.fromEntries(url.searchParams.entries());

  const devKey = await PB_DB.prepare('SELECT dev_key FROM apps WHERE app_id = ?').bind(app).first();
  if (!devKey) {
    return new Response('App not found', { status: 404 });
  }

  const isIos = app.startsWith('id') || /^\d+$/.test(app);
  const body = {
    request_count: 1,
    lang: '',    
    request_id: `${Date.now() - Math.round(Math.random() * 1000 * 1800)}-${1000000 + Math.round(Math.random() * 9000000)}`,
    is_first: true,
    timestamp: new Date().toISOString().replace('Z', ''),
    ...isIos ? {
      idfa: { value: idfa || '', type: 'unhashed' },
      os: version || '26.1',
      idfv: { value: crypto.randomUUID(), type: 'unhashed' },
      type: 'iPhone',
    } : {
      ...gaid ? { gaid: { value: gaid, type: 'unhashed' } } : {},
      os: version || '13',
      type: model || 'Pixel 5',
    },
  };

  return await fetch(`https://bfqimj.dlsdk.appsflyersdk.com/v1.0/${isIos ? 'ios' : 'android'}/${app}?sdk_version=6.17&af_sig=${calcAfSig(devKey!.dev_key as string, body.timestamp)}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': isIos ? `AppsFlyerSDK/6.17 (iPhone; iOS ${version || '26.1'}; Scale/3.00)` : `AppsFlyerSDK/6.17 (Android; Android ${version || '13'}; Scale/3.00)`,
      ...(ip ? { 'X-Forwarded-For': ip } : {}),
    },
  });
}