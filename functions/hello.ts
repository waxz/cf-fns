
// import {load_wasm} from "../src/utils/load_wasm.js";
import { load_wasm } from "../src/utils/load_wasm_web.js";
// import {load_wasm} from "../src/utils/load_wasm_bunlder.js";

import { getGfwTextCached } from "../src/utils/gfw";

const collectStream = async (stream: ReadableStream): Promise<string> => {
  const chunks: Uint8Array[] = []

  // @ts-ignore
  for await (const chunk of stream) {
    chunks.push(chunk)
  }

  const size = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
  const buffer = new Uint8Array(size)
  let offset = 0

  chunks.forEach((chunk) => {
    buffer.set(chunk, offset)
    offset += chunk.byteLength
  })

  return new TextDecoder().decode(buffer)
}

// const wasi = new WASI();


// const wasi = new WASI({
//   args: [],
//   env: {},
//   bindings: {
//     // You can add custom bindings like console, fs, etc. if needed.
//     console: {
//       log: (...args) => console.log(...args),
//     },
//   },
// });
// const instance = new WebAssembly.Instance(mywasm, {wasi_snapshot_preview1: wasi.wasiImport});
// await wasi.start(instance);


// const instance = await WebAssembly.instantiate(mywasm, {
//   ...wasi.getImportObject(),
// });

// wasi.start(instance);



let GFWLIST;
let GFWLIST_PTR;

interface Env {
  KV: KVNamespace;
}

//wasi
import { WASI } from '@cloudflare/workers-wasi';
import mywasm from '../wasi-test-rust/target/wasm32-wasip1/release/wasi-test.wasm';
import mywasm_func from '../wasi-test-rust/target/wasm32-wasip1/release/math.wasm';

function writeArrayToStream(array, writableStream) {
  
  const writer = writableStream.getWriter();
  
  array.forEach(chunk => writer.write(chunk).catch(() => {}));
  
  
  
  return writer.close();
  
  }
async function writeStringToStream(data, writableStream) {
  const encoder = new TextEncoder();
  const array = encoder.encode(data);
  const writer = writableStream.getWriter();

  try {
    for (const chunk of array) {
      await writer.write(Uint8Array.of(chunk)); // Ensure it's a Uint8Array
    }
    await writer.close();
    console.log('All done writing to stream!');
  } catch (e) {
    console.error('Error writing to stream:', e);
    throw e; // Re-throw the error to be caught by the caller
  } finally {
    // Ensure the writer is always released
    writer.releaseLock();
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {

  const {request,env} = context;
 


  {

    //https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts
    const stdout = new TransformStream();
    const stderr = new TransformStream(); // Create a TransformStream for stderr
    const stdinStream = new TransformStream();

writeStringToStream("hello stdin from js", stdinStream.writable)

.then(() => console.log('All done!'))

.catch(e => console.error('Error with the stream: ' + e));
    const wasi = new WASI({
      args: ["write",'/tmp/a.txt',"hello https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts"],
      // args: ["read",'/tmp/a.txt',"data"],

      // preopens: { '/tmp': '/sandbox_data' },
      preopens:['/tmp']  ,

      fs: {
        '/tmp/my_file.txt': 'This is the content of my file.',
        '/tmp/another_file.bin': new Uint8Array([1, 2, 3]), // Binary data
      },
      env:{
        PROJECT_NAME: "cf"

      },
      stdin: stdinStream.readable,
      stdout: stdout.writable,
      stderr: stderr.writable, // Assign stderr's writable stream
    });

    // Instantiate our WASM with our demo module and our configured WASI import.
    const instance = new WebAssembly.Instance(mywasm, {
      wasi_snapshot_preview1: wasi.wasiImport,
    });
    const instance_func = new WebAssembly.Instance(mywasm_func, {
      wasi_snapshot_preview1: wasi.wasiImport,
    });
    


    // Keep our worker alive until the WASM has finished executing.
    const promise = wasi.start(instance)

    const streams = await Promise.all([
      collectStream(stdout.readable),
      collectStream(stderr.readable),
    ])
  
    try {
      const result = {
        stdout: streams[0],
        stderr: streams[1],
        status: await promise,
      }
      // return result
      console.log(result);

      return new Response(result.stdout);
    } catch (e: any) {
      e.message = `${e}\n\nstdout:\n${streams[0]}\n\nstderr:\n${streams[1]}\n\n`
      throw e
    }



  }


  const gfwList = await getGfwTextCached(context, false);
  // console.log(`gfwList:\n${gfwList.slice(10)}`);


  // Pass the absolute URL to the WASM file manually
  const url = new URL(context.request.url);

  const a = 1.33;
  const b = 3.21;



  const handler = async (wasm: any) => {
    const url_str = url.toString();
    wasm.rs_url(url_str);


    if (gfwList && !GFWLIST) {
      GFWLIST_PTR = wasm.my_alloc(gfwList.length);
      GFWLIST = new Uint8Array(wasm.memory.buffer, GFWLIST_PTR, gfwList.length);
      console.log(`wasm.my_alloc ptr = ${GFWLIST_PTR}`)
      // const mem = new Uint8Array(wasm.memory.buffer, ptr, size)

      const encoder = new TextEncoder();
      const encoded = encoder.encode(gfwList);
      if (encoded.length > GFWLIST.length) {
        throw new Error("Message is too long for the buffer");
      }

      // Copy the bytes into WASM memory
      GFWLIST.set(encoded);

    }


    const sum = wasm.print_buffer(GFWLIST_PTR, 2);
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