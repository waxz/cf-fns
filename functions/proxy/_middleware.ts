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
  const ext = getFileExtensionFromUrl(url.pathname);

  if (["css", "png", "js", "json", "ico", "jpg", "jpeg", "svg", "webp"].includes(ext)) {
    // Clone request and remove caching headers
    const headers = new Headers(request.headers);
    headers.delete("if-modified-since");
    headers.delete("if-none-match");

    const newRequest = new Request(request, { headers });

    const asset = await env.ASSETS.fetch(newRequest);
    return asset;
  }

  return context.next();
}


export const onRequest = [preprocess];