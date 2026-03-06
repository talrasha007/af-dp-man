import type { APIRoute } from 'astro';

const originUrl = 'https://exness.onelink.me/ktkL/0j5yyo15?_8f4z=1&ex_ol=1&track_uid=749d98b0-848f-4863-96aa-afdb4b7ac40d&agent=c_h1yd65dg9x&agent_full_path=%2Fa%2Fc_h1yd65dg9x%3F_8f4z%3D1%26platform%3Dmobile%26ex_ol%3D1&agent_platform=mt4&agent_timestamp=1772809784225&af_sub3=c_h1yd65dg9x&af_sub4=749d98b0-848f-4863-96aa-afdb4b7ac40d&af_sub5=eyJhZ2VudF9mdWxsX3BhdGgiOiAiL2EvY19oMXlkNjVkZzl4P184ZjR6PTEmcGxhdGZvcm09bW9iaWxlJmV4X29sPTEiLCAiYWdlbnRfcGxhdGZvcm0iOiAibXQ0IiwgImFnZW50X3RpbWVzdGFtcCI6IDE3NzI4MDk3ODQyMjV9';

export const GET: APIRoute = async ({}) => {
  const url = new URL(originUrl);
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

