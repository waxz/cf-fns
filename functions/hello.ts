
// import {load_wasm} from "../src/utils/load_wasm.js";
import { load_wasm } from "../src/utils/load_wasm_web.js";
// import {load_wasm} from "../src/utils/load_wasm_bunlder.js";

import { getGfwTextCached } from "../src/utils/gfw";

// import * as fs from 'node:fs/promises'
// import { ReadableStream } from 'node:stream/web'


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
  DB: D1Database;
}

//wasi
// import { WASI } from '@cloudflare/workers-wasi';
import { Environment, WASI, _FS } from '@cloudflare/workers-wasi';


import mywasm from '../wasi-test-rust/target/wasm32-wasip1/release/wasi-test.async.wasm';
import mywasm_func from '../wasi-test-rust/target/wasm32-wasip1/release/my_rust_function.wasm';


import * as child from 'node:child_process'
import * as fs from 'node:fs'
import { cwd } from 'node:process'
import path from 'path/posix'
import { ExecOptions, exec, writeStringToStream } from '../src/utils/wasi_common';


export const onRequest: PagesFunction<Env> = async (context) => {

  const { request, env, waitUntil } = context;

  const originalConsoleLog = console.log;

  console.log = (...args) => {
    originalConsoleLog(...args);
    // const logMessage = args.join(' ');
    const logMessage = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    originalConsoleLog("Attempting to save log:", logMessage); // Debugging log
    waitUntil(saveLogToD1(env.DB, logMessage));
  };

  async function saveLogToD1(database, message) {
    originalConsoleLog("saveLogToD1 called with:", message);
    try {
      const result = await database
        .prepare("INSERT INTO logs (timestamp, message) VALUES (?, ?)")
        .bind(Date.now(), message)
        .run();
      originalConsoleLog("Log saved to D1:", message, `Success: ${result.success}`);
      if (!result.success) {
        originalConsoleLog("D1 Insert Failed (No Exception):", JSON.stringify(result));
      }
    } catch (e) {
      originalConsoleLog("Error saving log to D1:", e);
    }
  }

  const myData = { name: 'John', age: 30 };
  console.log("User data:", JSON.stringify(myData));


  

    //https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts
    const stdin = new TransformStream();

    writeStringToStream("hello stdin from js", stdin.writable)
      .then(() => console.log('All done!'))
      .catch(e => console.error('Error with the stream: ' + e));



    {
      
      const execOptions: ExecOptions = {
        asyncify: true,
        args: ["write", '/tmp/a.txt', "hello https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts"],
        // args: ["read",'/tmp/a.txt',"data"],
  
        // preopens: { '/tmp': '/sandbox_data' },
        preopens: ['/tmp'],
  
        fs: {
          '/tmp/my_file.txt': 'This is the content of my file.',
          '/tmp/another_file.bin': new Uint8Array([1, 2, 3]), // Binary data
        },
        env: {
          PROJECT_NAME: "cf"
  
        },
        returnOnExit: false,
      }


      try {
        const result = await exec(execOptions,mywasm,stdin.readable );

        // return result
        console.log(result);
  
        // Restore the original console.log after the request is handled (optional, but good practice)
        console.log = originalConsoleLog;
  
  
        return new Response(result.stdout);
      } catch (e: any) {
        e.message = `${e}`;
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