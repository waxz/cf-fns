 
export async function onRequest(context) {
  // Pass the absolute URL to the WASM file manually
  const url = new URL(context.request.url);

  const wasmUrl = new URL("/pkg/src_wasm_bg.wasm", url.protocol +  url.host).toString();
  // const wasmUrl = new URL("/pkg/src_wasm_bg.wasm", `https://${context.env.PAGES_URL}`).toString();
 

  var result = 1.0;
  
  return new Response(`WASM result: ${result}`);
}