import init   from "../../app-rust/pkg/web/src_wasm.js";

  import wasmUrl from "../../app-rust/pkg/web/src_wasm_bg.wasm"; // 👈 this is crucial
  import wasmBinary from '../../app-rust/pkg/web/src_wasm_bg.wasm?module';

  let wasmInstance: WebAssembly.WebAssemblyInstantiatedSource;

// @ts-ignore
import wasmModule from "../../app-rust/pkg/src_wasm_bg.wasm";
let wasmReady = false;
let wasm;

export async function load_wasm(context, f){
    const {request, env} = context;

    var url = new URL(request.url);
    url.pathname = "/pkg/web/src_wasm_bg.wasm";
    var newReq = new Request(
      url.toString()
    );


    try {

        if (!wasm) {

            {
                // run ok
            wasm = await init(wasmUrl);

            }

            { 
                // const wasmBinary = await env.ASSETS.fetch(newReq);
                // const buffer = await wasmBinary.arrayBuffer();
                // await init(buffer); // or: 
                //  await init({ module: buffer });
            }
 
 

          }

          const ptr = wasm.get_char_buffer_ptr();
          const len = wasm.get_char_buffer_len();
          const mem = new Uint8Array(wasm.memory.buffer, ptr, len);
  mem[0] = 5;
  mem[1] = 7;

  const sum = wasm.print_buffer();
  console.log(`sum = ${sum}`)

 

  return f(wasm);


     
      } catch (error) {
        console.error("Error using WebAssembly:", error);

      }

}