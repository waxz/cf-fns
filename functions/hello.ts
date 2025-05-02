
// import {load_wasm} from "../src/utils/load_wasm.js";
import { load_wasm } from "../src/utils/load_wasm_web.js";
// import {load_wasm} from "../src/utils/load_wasm_bunlder.js";

import {getGfwTextCached} from "../src/utils/gfw";

 let   GFWLIST ;
let   GFWLIST_PTR ;

interface Env {
  KV: KVNamespace;
}



export const onRequest: PagesFunction<Env> = async (context) => {


  const gfwList = await getGfwTextCached(context,false);
  console.log(`gfwList:\n${gfwList.slice(10)}`);


  // Pass the absolute URL to the WASM file manually
  const url = new URL(context.request.url);

  const a = 1.33;
  const b = 3.21;



  const handler = async (wasm: any) => {
    const url_str = url.toString();
    wasm.rs_url(url_str);


    if (gfwList && !GFWLIST){
      GFWLIST_PTR =  wasm.my_alloc(gfwList.length);
      GFWLIST = new Uint8Array(wasm.memory.buffer, GFWLIST_PTR, gfwList.length);
      console.log(`wasm.my_alloc ptr = ${GFWLIST_PTR}`)
    }
    // const mem = new Uint8Array(wasm.memory.buffer, ptr, size)
    
    const encoder = new TextEncoder();
    const encoded = encoder.encode(gfwList);
    if (encoded.length > GFWLIST.length) {
      throw new Error("Message is too long for the buffer");
    }

    // Copy the bytes into WASM memory
    GFWLIST.set(encoded);

    const sum = wasm.print_buffer(GFWLIST_PTR, 10);
    // console.log(`sum = ${sum}`)


    {
      // const ptr = wasm.get_char_buffer_ptr();
      // const len = wasm.get_char_buffer_len();
      // const mem = new Uint8Array(wasm.memory.buffer, ptr, len);
    }

    // Encode the string as UTF-8 bytes
 

    // Ensure the buffer has enough space

    



    // mem[0] = 5;
    // mem[1] = 7;
  

    return wasm.rs_add(a, b);
  };

  const result = await load_wasm(context, handler);


  return new Response(`rs_add(${a},${b}) = ${result}`);
}