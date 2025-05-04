export async function preprocess(context) {
  const { request, env } = context;
  const url = new URL(request.url);



  console.log(`main recieve url: ${url}`);
  console.log(`main recieve headers: ${JSON.stringify(request.headers)}`);
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


export const onRequest = [preprocess];
