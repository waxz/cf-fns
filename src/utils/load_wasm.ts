import * as wasm from "../../app-rust/pkg/node/src_wasm_bg.js";
// @ts-ignore
import wasmModule from "../../app-rust/pkg/node/src_wasm_bg.wasm";

export async function load_wasm(context,f){
    try {
        const imports = {
          "./src_wasm_bg.js": wasm,
        };
    
        const result = await WebAssembly.instantiate(wasmModule, imports);
    
        if (!result) {
          console.error("WebAssembly instantiation failed (no result):", result);
          return;
        }
    
        wasm.__wbg_set_wasm(result.exports); // Try accessing exports directly from 'result'

        return f(wasm);
     
      } catch (error) {
        console.error("Error using WebAssembly:", error);

      }

}