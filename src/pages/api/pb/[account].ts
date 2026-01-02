import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params: { account }, url, locals: { runtime } }) => {
  const { orderNum, sAmount: sAmountStr, eCommis: eCommisStr, cTime, pTime, region, device, tracking } = Object.fromEntries(url.searchParams.entries());
  if (orderNum && sAmountStr && eCommisStr && cTime && pTime && region && device && tracking) {
    const sAmount = parseFloat(sAmountStr);
    const eCommis = parseFloat(eCommisStr);
    if (isNaN(sAmount) || isNaN(eCommis)) {
      return Response.json({ status: 'error', message: 'Invalid amount format' }, { status: 400 });
    }

    if (tracking.indexOf(`|${account}|`) === -1) {
      return Response.json({ status: 'error', message: 'Tracking does not match account' }, { status: 400 });
    }
  }
  
  return Response.json({ status: 'ok' });
};