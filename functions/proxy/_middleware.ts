export async function preprocess(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop()?.split('?')[0] || '';
  console.log(`proxy preprocess: ${url}`);

  return context.next();
}

export const onRequest = [preprocess];
