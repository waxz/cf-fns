import { print_request } from "../src/utils/print_request";
import { checkCookiesLoginexist } from "./login/auth";

import { onRequestOptions } from "../src/utils/response"
import { index_html } from "../src/resource"
import { template_replace } from "../src/utils/template_replace"

import {init_client,axiom_logger} from "../src/utils/axiom"


async function errorHandling(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

export async function preprocess(context) {
  const { request, env } = context;
  await init_client(context);

  // if (request.method === 'OPTIONS') {
  //   return onRequestOptions();
  // }


  const url = new URL(request.url);
  console.log(`preprocess: ${url}`);

  const login = checkCookiesLoginexist(request.headers);


  var nav = `
          <p > 
            <a href="/login"> Login</a> 
            <button onclick="logout()">Logout</button>
        </p>
  
  `;

  const headers = new Headers();
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("content-type", "text/html;charset=UTF-8");

  // prevent caching redirect
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  console.log(`login: ${login}`);
  if (!login) {

    // prevent caching redirect

    if (!(url.pathname == "/404" || url.pathname == "/" || url.pathname.startsWith("/login")  )   ) {
      // const url_404 = url;
      // url_404.pathname = "/";
      // headers.set('Location', url_404.toString());
      // return new Response('', { status: 307, headers: headers });

      const replacements = {
        nav: nav,
      };
  
      const resepond_html = template_replace(index_html, replacements);
  
      return new Response(resepond_html, {
        status: 200,
        headers: headers,
      });


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

  if (url.pathname == "/") {
    nav = `
    <p > 
      <a href="/login"> Login</a> 
      <button onclick="logout()">Logout</button>
  </p>
  <p > 
      <a href="/hello"> hello</a> 
  </p>
  <p > 
      <a href="/cf-api"> cf-api</a> 
  </p>
  <p > 
      <a href="/quartz"> Quartz</a> 
  </p>
  <p > 
      <a href="/proxy"> proxy</a> 
  </p>
`;

    const replacements = {
      nav: nav,
    };

    const resepond_html = template_replace(index_html, replacements);

    return new Response(resepond_html, {
      status: 200,
      headers: headers,
    });

  }
  return context.next();
  // fallback for other requests
  return env.ASSETS.fetch(request);
}


export const onRequest = [errorHandling, preprocess];
