
import {load_wasm} from "../src/utils/load_wasm.js";

 
export async function onRequest(context) {

  // Pass the absolute URL to the WASM file manually
  const url = new URL(context.request.url);

  const a = 1.33;
  const b = 3.21;



const handler = async (wasm: any) => {
  const url_str = url.toString();
  wasm.rs_url(url_str);
  return wasm.rs_add(a,b);
};

const result = await load_wasm(handler);

  
  return new Response(`rs_add(${a},${b}) = ${result}`);
}