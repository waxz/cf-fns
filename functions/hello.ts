
// import {load_wasm} from "../src/utils/load_wasm.js";
import { load_wasm } from "../src/utils/load_wasm_web.js";
// import {load_wasm} from "../src/utils/load_wasm_bunlder.js";


let   memory_data ;
let   memory_data_ptr ;


export async function onRequest(context) {

  // Pass the absolute URL to the WASM file manually
  const url = new URL(context.request.url);

  const a = 1.33;
  const b = 3.21;



  const handler = async (wasm: any) => {
    const url_str = url.toString();
    wasm.rs_url(url_str);

    const size = 100;

    if (!memory_data){
      memory_data_ptr =  wasm.my_alloc(size);
      memory_data = new Uint8Array(wasm.memory.buffer, memory_data_ptr, size);
      console.log(`wasm.my_alloc ptr = ${memory_data_ptr}`)

      memory_data.fill(0);

    }
    // const mem = new Uint8Array(wasm.memory.buffer, ptr, size)
    
    const msg = "hello";
    const encoder = new TextEncoder();
    const encoded = encoder.encode(msg);
    if (encoded.length > memory_data.length) {
      throw new Error("Message is too long for the buffer");
    }

    // Copy the bytes into WASM memory
    memory_data.set(encoded);
    memory_data[5] = memory_data[5] + 1;

    const sum = wasm.print_buffer(memory_data_ptr, 10);
    console.log(`sum = ${sum}`)


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