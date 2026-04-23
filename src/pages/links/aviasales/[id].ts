import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params: { id }, request: { headers } }) => {
  const res = await fetch(`https://aviasales.tpo.lv/${id}`, { headers, redirect: 'manual' });
  const target = res.headers.get('location');
  if (!target) {
    return new Response('Failed to retrieve target URL', { status: 500 });
  }

  const auidHtml = await fetch('https://www.aviasales.com/auid/refresh', { headers }).then(res => res.text());
  const auid = auidHtml.match(/<body[^>]*>(.*?)<\/body>/s)?.[1].trim();
  if (!auid) {
    return new Response('Failed to retrieve auid', { status: 500 });
  }

  const url = new URL(target);
  const afSub1 = url.searchParams.get('marker');
  const afSub3 = auid;

  if (!afSub1) {
    return new Response('Failed to retrieve marker', { status: 500 });
  }

  const afDp = new URL('aviasales://search?utm_source=aviasales&utm_campaign=mobile-web-redirect');
  afDp.searchParams.set('auid', auid);

  // const redirectUrl = new URL('https://aviasales.onelink.me/4159769142?pid=mobilewebredirect&is_retargeting=true&af_inactivity_window=30d&af_click_lookback=1d');
  const redirectUrl = new URL('https://impressions.onelink.me/NSBk?af_xplatform_vt_lookback=72h&af_xplatform=true&pid=mobilewebredirect&is_retargeting=true&af_inactivity_window=30d&af_click_lookback=1d');
  if (headers.get('user-agent')?.toLowerCase().includes('iphone')) {
    redirectUrl.searchParams.set('af_adset', 'ios');
  } else {
    redirectUrl.searchParams.set('af_adset', 'android');
  }
  redirectUrl.searchParams.set('af_dp', afDp.toString());
  redirectUrl.searchParams.set('af_sub1', afSub1);
  redirectUrl.searchParams.set('af_sub3', afSub3);
  return Response.redirect(redirectUrl, 302);
}