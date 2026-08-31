import crypto from 'crypto';
import type { APIRoute } from 'astro';

function calcAfSig(devKey: string, afTimestamp: string, ip: string) {
  return crypto.createHmac('sha256', devKey).update(afTimestamp + (ip || '127.0.0.1'), 'utf8').digest('hex');
}

export const GET: APIRoute = async ({ url, locals: { runtime: { env: { PB_DB } } } }) => {
  const { app, gaid, idfa, ip, model, version } = Object.fromEntries(url.searchParams.entries());

  const isIos = app.startsWith('id') || /^\d+$/.test(app);
  const appId = isIos ? app.replace(/^id/, '') : app; // ios: pure numeric, used for lookup/insert/getDevKey

  let devKey = (await PB_DB.prepare('SELECT dev_key FROM apps WHERE app_id IN (?, ?)').bind(app, appId).first())?.dev_key as string | undefined;
  if (!devKey) {
    const res = await fetch(`http://39.97.61.40/tt/ddj/dlTask!getDevKey.do?appId=${encodeURIComponent(appId)}`)
      .then(r => r.json() as Promise<{ devKey?: string, code?: number }>).catch(() => null);
    if (res?.code === 1 && res.devKey) {
      devKey = res.devKey;
      await PB_DB.prepare('INSERT OR IGNORE INTO apps (app_id, dev_key) VALUES (?, ?)').bind(appId, devKey).run();
    }
  }
  if (!devKey) {
    return new Response('App not found', { status: 404 });
  }

  const requestIp = ip || '127.0.0.1';
  const timestamp = new Date().toISOString().replace('Z', '');
  const body = {
    request_count: 1,
    lang: '',
    request_id: `${Date.now() - Math.round(Math.random() * 1000 * 1800)}-${1000000 + Math.round(Math.random() * 9000000)}`,
    is_first: true,
    timestamp,
    ip: requestIp,
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

  const afSig = calcAfSig(devKey, timestamp, requestIp);
  const endpoint = new URL(`https://dls2s.appsflyer.com/v1.0/${isIos ? `ios/id${appId}` : `android/${appId}`}`);
  endpoint.searchParams.set('af_sig', afSig);

  return await fetch(endpoint.toString(), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      // 'User-Agent': isIos ? `AppsFlyerSDK/6.17 (iPhone; iOS ${version || '26.1'}; Scale/3.00)` : `AppsFlyerSDK/6.17 (Android; Android ${version || '13'}; Scale/3.00)`,
      // 'User-Agent': 'DLSDK S2S V1.0',
      ...(ip ? { 'X-Forwarded-For': ip } : {}),
    },
  });
}
