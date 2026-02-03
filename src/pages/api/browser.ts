import puppeteer, { KnownDevices } from '@cloudflare/puppeteer';
import type { BrowserWorker, Metrics } from '@cloudflare/puppeteer';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals: { runtime: { env: { MYBROWSER } } } }) => {
  const uri = url.searchParams.get('url') || 'https://d27tmy7atbm8yh.cloudfront.net/';
  const proxyServer = url.searchParams.get('proxy') || undefined;
  const proxyUsername = url.searchParams.get('proxy-user') || undefined;
  const proxyPassword = url.searchParams.get('proxy-pass') || undefined;

  const browser  = await connectToBrowserWorker(MYBROWSER);
  const context = await browser.createBrowserContext({ proxyServer });
  const page = await context.newPage();

  if (proxyUsername && proxyPassword) {
    await page.authenticate({
      username: proxyUsername,
      password: proxyPassword,
    });
  }

  const ua = url.searchParams.get('ua') || undefined;
  if (ua) {
    await page.setUserAgent(ua);
  }

  const resp = await page.goto(uri);
  // const metrics = await page.metrics();
  const html = await resp?.text();
  await page.close();
  await context.close();
  await browser.disconnect();

  if (url.searchParams.get('json') === 'true') {
    return Response.json({ html, headers: resp?.headers() });
  } else {
    return new Response(html, { headers: resp?.headers() });
  }
}

type DeviceName = keyof typeof KnownDevices;

type BrowserRequestOptions = {
  url: string;
  ua?: string;
  device?: DeviceName;
  proxy?: {
    url: string;
    username?: string;
    password?: string;
  },
  click?: string;
  prefix?: string;
  returnMetrics?: boolean;
  returnHtml?: boolean;
  returnJson?: boolean;
  returnHeaders?: boolean;
};

type BrowserResponse = {
  metrics?: Metrics;
  url?:     string;
  headers?: Record<string, string>;
  json?:    any;
  html?:    string;
  matches?: string[];
}

export const POST: APIRoute = async ({ request, locals: { runtime: { env: { MYBROWSER } } } }) => {
  const ret = {} as BrowserResponse;

  const opt = await request.json<BrowserRequestOptions>();
  console.log(JSON.stringify(opt, null, 2));

  const browser  = await connectToBrowserWorker(MYBROWSER);
  const context = await browser.createBrowserContext({ proxyServer: opt.proxy?.url });
  const page = await context.newPage();

  if (opt.proxy?.username && opt.proxy?.password) {
    await page.authenticate({
      username: opt.proxy.username,
      password: opt.proxy.password,
    });
  }

  if (opt.prefix) {
    ret.matches = [];
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = req.url();
      // console.log('Request:', u);
      if (u.startsWith(opt.prefix!)) { ret.matches!.push(u); }

      if (
        u.includes('apple.com') || u.includes('play.google.com') ||
        u.endsWith('.css') || u.endsWith('.woff') || u.endsWith('.woff2') || u.endsWith('.ttf')
      ) {
        req.abort();
        return;
      }
      
      req.continue();
    });
  }

  if (opt.device) {
    const device = KnownDevices[opt.device];
    device && await page.emulate(device);
  }

  if (opt.ua) {
    await page.setUserAgent(opt.ua);
  }

  const resp = await page.goto(opt.url, { waitUntil: "networkidle2" });
  if (resp?.ok()) {
    if (opt.returnMetrics) { ret.metrics = await page.metrics(); }
    if (opt.returnHtml) { ret.html = await resp?.text(); }
    if (opt.returnJson) ret.json = await resp?.json();
    if (opt.returnHeaders) ret.headers = resp?.headers();
    ret.url = resp?.url();

    if (opt.click) {
      // console.log('    Clicking on:', opt.click);
      await page.click(opt.click);
      // wait for network to be idle
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
  } else {
    ret.url = resp?.url();
    ret.html = `Error: ${resp?.status()} ${resp?.statusText()}`;
  }

  await page.close();
  await context.close();
  await browser.disconnect();

  return Response.json(ret);
}

async function connectToBrowserWorker(endpoint: BrowserWorker) {
  return await puppeteer
    .connect(endpoint, await getRandomSession(endpoint))
    .catch(async () => await puppeteer.launch(endpoint, { keep_alive: 600 * 1000 }));
}

// Pick random free session
// Other custom logic could be used instead
async function getRandomSession(endpoint: BrowserWorker) {
  const sessions = await puppeteer.sessions(endpoint);
  const sessionsIds = sessions
    .filter((v) => {
      return !v.connectionId; // remove sessions with workers connected to them
    })
    .map((v) => {
      return v.sessionId;
    });
  if (sessionsIds.length === 0) {
    return;
  }

  const sessionId = sessionsIds[Math.floor(Math.random() * sessionsIds.length)];

  return sessionId;
}
