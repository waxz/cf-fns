
// import {load_wasm} from "../src/utils/load_wasm.js";
import { load_wasm } from "../src/utils/load_wasm_web.js";
// import {load_wasm} from "../src/utils/load_wasm_bunlder.js";

import { getGfwTextCached } from "../src/utils/gfw";

// import * as fs from 'node:fs/promises'
// import { ReadableStream } from 'node:stream/web'





let GFWLIST;
let GFWLIST_PTR;

interface Env {
  KV: KVNamespace;
  DB: D1Database;
}

//wasi
// import { WASI } from '@cloudflare/workers-wasi';
// import { Environment, WASI } from '@cloudflare/workers-wasi';


import {wasi_test} from "../src/resource";


// import * as child from 'node:child_process'
// import * as fs from 'node:fs'
// import { cwd } from 'node:process'
// import * as process from 'node:process';
// import path from 'path/posix'

import { ExecOptions, exec,run, writeStringToStream } from '../src/utils/wasi_common';


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
        asyncify: false,
        // args: ["write", '/tmp/a.txt', "hello https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts"],
        args: ["read",'/index.html',"data"],
  
        // preopens: { '/tmp': '/sandbox_data' },
        preopens: ['/tmp','/'],
  
        fs: {
          '/tmp/my_file.txt': 'This is the content of my file.',
          '/tmp/another_file.bin': new Uint8Array([1, 2, 3]), // Binary data
        },
        env: {
          PROJECT_NAME: "cf",
          wasi_output: "wasi_output from cf",
  
        },
        returnOnExit: false,
      }


      try {

        const callback = async (instance: WebAssembly.Instance) : Promise<number> => {
          console.log("run callback");
          const { memory, _exit, write_to_buffer, get_buffer_ptr } = instance.exports;
          {
            const write_to_buffer_func = write_to_buffer as CallableFunction;
            const get_buffer_ptr_func = get_buffer_ptr as CallableFunction;
            const memory_array = memory as WebAssembly.Memory;
        
            // Call Rust function to write to buffer
            const len = write_to_buffer_func();
        
            // Get pointer to buffer
            const ptr = get_buffer_ptr_func();
        
            // Create a typed array view into the WASM memory
            const bytes = new Uint8Array(memory_array.buffer, ptr, len);
            const message = new TextDecoder().decode(bytes);
        
            console.log("Message from Rust buffer:", message);
          }
  // 👇 Call a WASM function that exits the process if needed
  if (_exit) {
    (_exit as CallableFunction)(0);
  }
          return 0;

        }
        const runResult = await run(execOptions,wasi_test ,callback);
        console.log("after callback");

        console.log(runResult);
        console.log("after runResult");
 
        console.log("JSON.stringify(env)");

        console.log(JSON.stringify(env));


        // return result
        const result = await exec(execOptions,wasi_test,stdin.readable );
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