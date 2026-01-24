import puppeteer from '@cloudflare/puppeteer';
import type { WorkersLaunchOptions } from '@cloudflare/puppeteer';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url, locals: { runtime: { env: { MYBROWSER } } } }) => {
  const uri = url.searchParams.get('url') || 'https://d27tmy7atbm8yh.cloudfront.net/';
  const country = url.searchParams.get('country') || 'US';

  const browser  = await puppeteer.launch(MYBROWSER, { location: country as WorkersLaunchOptions['location'] });
  const page = await browser.newPage();
  await page.goto(uri);
  // const metrics = await page.metrics();
  const html = await page.evaluate(() => document.documentElement.innerHTML);
  await browser.close();

  return new Response(html);
}