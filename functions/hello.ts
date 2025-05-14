
// import {load_wasm} from "../src/utils/load_wasm.js";
import { load_wasm } from "../src/utils/load_wasm_web.js";
// import {load_wasm} from "../src/utils/load_wasm_bunlder.js";

import { getGfwTextCached } from "../src/utils/gfw";

// import * as fs from 'node:fs/promises'
// import { ReadableStream } from 'node:stream/web'

import { encode_text, get_memory_array } from "../src/utils/encode"



let GFWLIST;
let GFWLIST_PTR;

interface Env {
  KV: KVNamespace;
  DB: D1Database;
}

//wasi
// import { WASI } from '@cloudflare/workers-wasi';
// import { Environment, WASI } from '@cloudflare/workers-wasi';


import { html_test } from "../src/resource";


// import * as child from 'node:child_process'
// import * as fs from 'node:fs'
// import { cwd } from 'node:process'
// import * as process from 'node:process';
// import path from 'path/posix'

import { ExecOptions, exec, run, writeStringToStream, get_instance } from '../src/utils/wasi_common';
function createRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


export const onRequest: PagesFunction<Env> = async (context) => {

  const { request, env, waitUntil } = context;

  const originalConsoleLog = console.log;

  // console.log = (...args) => {
  //   originalConsoleLog(...args);
  //   // const logMessage = args.join(' ');
  //   const logMessage = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
  //   originalConsoleLog("Attempting to save log:", logMessage); // Debugging log
  //   waitUntil(saveLogToD1(env.DB, logMessage));
  // };

  // async function saveLogToD1(database, message) {
  //   originalConsoleLog("saveLogToD1 called with:", message);
  //   try {
  //     const result = await database
  //       .prepare("INSERT INTO logs (timestamp, message) VALUES (?, ?)")
  //       .bind(Date.now(), message)
  //       .run();
  //     originalConsoleLog("Log saved to D1:", message, `Success: ${result.success}`);
  //     if (!result.success) {
  //       originalConsoleLog("D1 Insert Failed (No Exception):", JSON.stringify(result));
  //     }
  //   } catch (e) {
  //     originalConsoleLog("Error saving log to D1:", e);
  //   }
  // }

  const myData = { name: 'John', age: 30 };
  console.log("User data:", JSON.stringify(myData));




  //https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts
  const stdin = new TransformStream();

  writeStringToStream("hello stdin from js", stdin.writable)
    .then(() => console.log('All done!'))
    .catch(e => console.error('Error with the stream: ' + e));



  {

    const html_test_execOptions: ExecOptions = {
      moduleName: "html_rewriter",
      presist: true,
      asyncify: false,
      // args: ["write", '/tmp/a.txt', "hello https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts"],
      args: ["read", '/index.html', "data"],

      // preopens: { '/tmp': '/sandbox_data' },
      preopens: ['/tmp', '/'],

      fs: {
        '/tmp/my_file.txt': 'This is the content of my file.',
        '/tmp/data.txt': createRandomString(100)

      },
      env: {
        PROJECT_NAME: "cf",
        wasi_output: "wasi_output from cf",

      },
      returnOnExit: false,
    }

    const execOptions: ExecOptions = {
      moduleName: "wasm_main",
      presist: true,
      asyncify: false,
      // args: ["write", '/tmp/a.txt', "hello https://github.com/cloudflare/workers-wasi/blob/main/src/index.ts"],
      args: ["read", '/index.html', "data"],

      // preopens: { '/tmp': '/sandbox_data' },
      preopens: ['/tmp', '/'],

      fs: {
        '/tmp/my_file.txt': 'This is the content of my file.',
        '/tmp/data.txt': createRandomString(100)
      },
      env: {
        PROJECT_NAME: "cf",
        wasi_output: "wasi_output from cf",

      },
      returnOnExit: false,
    }


    try {

      const callback = async (instance: WebAssembly.Instance): Promise<number> => {
        console.log("run callback");
        const { memory, _exit, my_init } = instance.exports;
        {
          const memory_array = memory as WebAssembly.Memory;

          const my_init_f = my_init as CallableFunction;
          // const hello_num_func = hello_num as CallableFunction;
          // const hello_str_func = hello_str as CallableFunction;
          // const get_buffer_ptr_func = get_buffer_ptr as CallableFunction;
          // const get_buffer_len_func = get_buffer_len as CallableFunction;
          // const get_input_buffer_ptr_func = get_input_buffer_ptr as CallableFunction;
          // const my_alloc_func = my_alloc as CallableFunction;

          // my_alloc_func(100);
          my_init_f();



          // const input_ptr = get_input_buffer_ptr_func();
          // const input_data ="hello from cf";
          // const input_memory = new Uint8Array(memory_array.buffer, input_ptr, input_data.length);

          // // Copy the bytes into WASM memory
          // input_memory.set(new TextEncoder().encode(input_data));




          // const rt = init_ta_alloc_func();

          // const rt2 = hello_num_func(55);
          // hello_str_func(input_memory.byteOffset,input_memory.byteLength);


          // console.log(`init_ta_alloc_func: ${rt}, rt2: ${rt2}`);
          // // const hello_num_func = hello_num as CallableFunction;
          // // Call Rust function to write to buffer
          // const len = get_buffer_len_func();

          // // Get pointer to buffer
          // const ptr = get_buffer_ptr_func();
          // console.log(`ptr: ${ptr}, len: ${len}`);

          // // Create a typed array view into the WASM memory
          // const bytes = new Uint8Array(memory_array.buffer, ptr, len);
          // const message = new TextDecoder().decode(bytes);

          // console.log("Message from Rust buffer:", message);
          // hello_func();
          // hello_num_func(123);



          // Create a typed array view into the WASM memory
          // const message = new TextDecoder().decode(bytes);
          // console.log("Message from Rust buffer:", message);
        }
        // 👇 Call a WASM function that exits the process if needed
        if (_exit) {
          (_exit as CallableFunction)(0);
        }
        return 0;

      }
      // const runResult = await run(html_test_execOptions, html_test, callback);

      const instance = get_instance(html_test_execOptions, html_test);


      {
        const { memory, _exit, mem_alloc, mem_addr, mem_size,change_string } = instance.exports;
        const memory_array = memory as WebAssembly.Memory;

        const mem_alloc_f = mem_alloc as CallableFunction;
        const mem_addr_f = mem_addr as CallableFunction;
        const mem_size_f = mem_size as CallableFunction;
        const change_string_f = change_string as CallableFunction;

        function send_string_to_wasm(data: string): Uint8Array {
          const data_array = encode_text(data);
          const mem_id = mem_alloc_f(data_array.byteLength);
          const ptr = mem_addr_f(mem_id);
          const size = mem_size_f(mem_id);
          console.log(`ptr:${ptr}, size:${size}`)

          const buffer = get_memory_array(data_array, ptr, memory_array.buffer);
          return buffer;
        }

        function get_string_from_wasm(mem_id:Number):string{
          const ptr = mem_addr_f(mem_id);
          const size = mem_size_f(mem_id);
          console.log(`ptr:${ptr}, size:${size}`)

          const bytes = new Uint8Array(memory_array.buffer, ptr, size);
          const message = new TextDecoder().decode(bytes);
          return message;
        }



        const msg = "hello from cf"; 
        const buffer1 = send_string_to_wasm(msg);



        console.log(`send_string_to_wasm byteOffset:${buffer1.byteOffset}, byteLength:${buffer1.byteLength}`)



        let index2 = change_string_f(buffer1.byteOffset,buffer1.byteLength);

        const resp1 = get_string_from_wasm(index2);
        console.log(`change_string_f resp1:${resp1}`)


      }


      console.log("after callback");

      // console.log(runResult);
      // console.log("after runResult");

      // console.log("JSON.stringify(env)");

      // console.log(JSON.stringify(env));


      // // return result
      // const result = await exec(execOptions,
      //    wasi_test, 
      //    stdin.readable);
      // console.log(result);

      // // Restore the original console.log after the request is handled (optional, but good practice)
      // console.log = originalConsoleLog;


      // return new Response(result.stdout);
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