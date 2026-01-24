import puppeteer from '@cloudflare/puppeteer';
import type { Browser, BrowserWorker } from '@cloudflare/puppeteer';
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

  await page.goto(uri);
  // const metrics = await page.metrics();
  const html = await page.evaluate(() => document.documentElement.innerHTML);
  await page.close();
  await context.close();
  await browser.close();

  return new Response(html);
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
