import * as wasmModule  from "../../app-rust/pkg/bundler/src_wasm.js";
import wasmUrl from '../../app-rust/pkg/bundler/src_wasm_bg.wasm?module';



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
            wasm =   await wasmModule.default(wasmUrl)
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
