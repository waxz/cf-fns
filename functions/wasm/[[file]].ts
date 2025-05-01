export async function onRequest(context) {
  const {request, env} = context;

  var url = new URL(request.url);
  url.pathname = url.pathname.replace("/wasm","");
  var newReq = new Request(
    url.toString()
  );
    return   env.ASSETS.fetch(newReq);
 }