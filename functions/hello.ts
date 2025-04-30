import * as wasm from "../app-rust/pkg/src_wasm_bg.js";
// @ts-ignore
import wasmModule from "../app-rust/pkg/src_wasm_bg.wasm";


export async function onRequest(context) {
  // Pass the absolute URL to the WASM file manually
  const url = new URL(context.request.url);
  var add_result = 0.0;

  const a = 1.33;
  const b = 3.21;
  try{
    const imports = {
      "./src_wasm_bg.js": wasm,
    };

    const result = await WebAssembly.instantiate(wasmModule, imports);

    if (!result) {
      console.error("WebAssembly instantiation failed (no result):", result);
      return new Response("Error instantiating WebAssembly", { status: 500 });
    }

    wasm.__wbg_set_wasm(result.exports); // Try accessing exports directly from 'result'

    add_result = wasm.rs_add(a,b);
    console.log(`rs_add(${a},${b}) = ${add_result}`)



  }catch (error) {
    console.error("Error using WebAssembly:", error);
    return new Response("Error calculating distance", { status: 500 });
  }

  
  return new Response(`rs_add(${a},${b}) = ${add_result}`);
}