import { onRequestOptions } from "../../src/utils/response"
import { fetch_proxy } from "./proxy"
import { template_replace } from "../../src/utils/template_replace"

export async function preprocess(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return onRequestOptions();
  }


  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop()?.split('?')[0] || '';
  console.log(`proxy preprocess: ${url}`);

  const proxy_host = `${url.protocol}//${url.hostname}/proxy`


  const fetch_local_regex = /^\/proxy\/[a-zA-Z0-9.-]+\.js$/;

  const fetch_local = fetch_local_regex.test(url.pathname);
  const is_local = url.pathname == "/proxy" || url.pathname == "/proxy/";

  console.log(`fetch_local ${fetch_local}, ${url.pathname}, ${is_local}`); // true


  console.log(`find data for ${url}`)

  if (is_local || fetch_local) {
    console.log(`serve local data for ${url}`)

    // if (url.pathname.endsWith(".js")) {
    //   const asset = await env.ASSETS.fetch(request);
    //   const headers = new Headers(asset.headers);
    //   headers.set('Content-Type', 'application/javascript');

    //   const replacements = {
    //     PROXY_DOMAIN: proxy_host,
    //   };

    //   const body = template_replace(asset.body, replacements);




    //   return new Response(body, {
    //     status: asset.status,
    //     statusText: asset.statusText,
    //     headers,
    //   });




    // } else {
    //   return context.next();
    // }
      return context.next();


  } else {
    return fetch_proxy(context);
  }


  return context.next();
}

export const onRequest = [preprocess];
