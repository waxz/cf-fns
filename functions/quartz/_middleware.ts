function getFileExtensionFromUrl(url) {
  const parts = url.split('.');
  if (parts.length > 1) {
    return parts.pop();
  }
  return '';
}


export async function preprocess(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  console.log(`quartz recieve: ${url}`)
  if (url.pathname === "/quartz") {
    var new_url = url;
    new_url.pathname = "/quartz/";
    return Response.redirect(new_url, 301);
  }


  // const ext = getFileExtensionFromUrl(request.url);
  // if (ext == "css" || ext == "png" || ext == "js" || ext == "json") {
  //   console.log(`quartz env.ASSETS.fetch: ${url}: text/${ext};charset=UTF-8`);
  //   const asset = await env.ASSETS.fetch(request);

  //   return asset; 

  // }

  return context.next();
  // fallback for other requests
  return env.ASSETS.fetch(request);
}


export const onRequest = [preprocess];