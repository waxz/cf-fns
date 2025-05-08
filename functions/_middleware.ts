import { print_request } from "../src/utils/print_request";
import { checkCookiesLoginexist } from "./login/auth";

import {onRequestOptions} from "../src/utils/response"




async function errorHandling(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

export async function preprocess(context) {
  const { request, env } = context;

  // if (request.method === 'OPTIONS') {
  //   return onRequestOptions();
  // }


  const url = new URL(request.url);
  console.log(`preprocess: ${url}`);

  const login = checkCookiesLoginexist(request.headers);
  console.log(`login: ${login}`);
  if (!login) {

  // prevent caching redirect
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    if (!(url.pathname == "/404" || url.pathname == "/" || url.pathname.startsWith("/login"))) {
      const url_404 = url;
      url_404.pathname = "/404";
      headers.set('Location', url_404.toString());
      return new Response('', { status: 307, headers: headers });
    }
  }
  // print_request(context);

  // Serve WASM with correct MIME
  // if (request.url.endsWith('.wasm')) {
  //   const asset = await env.ASSETS.fetch(request);
  //   const headers = new Headers(asset.headers);
  //   headers.set('Content-Type', 'application/wasm');
  //   return new Response(asset.body, {
  //     status: asset.status,
  //     statusText: asset.statusText,
  //     headers,
  //   });
  // }

  return context.next();
  // fallback for other requests
  return env.ASSETS.fetch(request);
}


export const onRequest = [errorHandling, preprocess];
