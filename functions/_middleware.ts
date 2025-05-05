import {print_request} from "../src/utils/print_request";
import { checkCookiesLoginexist } from "./login/auth";

async function errorHandling(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

export async function preprocess(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const login = checkCookiesLoginexist(request.headers);
  console.log(`login: ${login}`);


  print_request(context);
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
