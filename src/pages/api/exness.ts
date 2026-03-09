import type { APIRoute } from 'astro';

const originUrl = 'https://exness.onelink.me/ktkL/0j5yyo15?_8f4z=1&ex_ol=1&track_uid=749d98b0-848f-4863-96aa-afdb4b7ac40d&agent=c_h1yd65dg9x&agent_full_path=%2Fa%2Fc_h1yd65dg9x%3F_8f4z%3D1%26platform%3Dmobile%26ex_ol%3D1&agent_platform=mt4&agent_timestamp=1772809784225&af_sub3=c_h1yd65dg9x&af_sub4=749d98b0-848f-4863-96aa-afdb4b7ac40d&af_sub5=eyJhZ2VudF9mdWxsX3BhdGgiOiAiL2EvY19oMXlkNjVkZzl4P184ZjR6PTEmcGxhdGZvcm09bW9iaWxlJmV4X29sPTEiLCAiYWdlbnRfcGxhdGZvcm0iOiAibXQ0IiwgImFnZW50X3RpbWVzdGFtcCI6IDE3NzI4MDk3ODQyMjV9';

function isIos(ua: string) {
  return /iPhone|iPad|iPod/i.test(ua);
}

export const GET: APIRoute = async ({ request: { headers }, url: { searchParams } }) => {
  const ua = searchParams.get('ua') || headers.get('user-agent') || '';
  const mapToAf = searchParams.get('map_to_af') === 'true';

  const url = new URL(originUrl);

  const ifa = searchParams.get('ifa');
  if (ifa) {
    if (isIos(ua)) {
      url.searchParams.set('idfa', ifa);      
    } else {
      url.searchParams.set('advertising_id', ifa);
    }
  }

  if (mapToAf) {
    url.hostname = 'app.appsflyer.com';

    const ua = headers.get('user-agent') || '';
    if (isIos(ua)) {
      url.pathname = '/id1359763701';
    } else {
      url.pathname = '/com.exness.android.pa';
    }

    url.searchParams.set('af_deeplink', 'true');    
    url.searchParams.set('af_dp', 'exness://pa');
    url.searchParams.set('af_xp', 'custom');
    url.searchParams.set('media_source', 'aff');
    url.searchParams.set('campaign', 'aff');
    url.searchParams.set('source_caller', 'ui');

    const dp = new URL('exness://pa');
    dp.search = url.search;
    url.searchParams.set('deep_link_value', dp.toString());
  }
  const params = url.searchParams;
  const agent_full_path = params.get('agent_full_path') || '';
  const agent_platform = params.get('agent_platform') || '';
  const agent_timestamp = Date.now();

  params.set('agent_timestamp', agent_timestamp.toString());

  const uuid = crypto.randomUUID();
  params.set('track_uid', uuid);
  params.set('af_sub4', uuid);

  const json = JSON.stringify({agent_full_path, agent_platform, agent_timestamp}).replace(/:/g, ': ').replace(/,/g, ', ');
  params.set('af_sub5', btoa(json));

  return Response.redirect(url.toString());
}

