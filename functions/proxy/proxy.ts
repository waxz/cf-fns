import { onRequestOptions } from "../../src/utils/response"
import { encodeToHex, decodeFromHex, isHexEncoded, replace_text } from "../../src/utils/encode"


import { axiom_logger } from "../../src/utils/axiom";

import { encode_text, get_memory_array } from "../../src/utils/encode"
import {get_headers} from "../../src/utils/print_request"

import { get_instance, ExecOptions } from "../../src/utils/wasi_common"
import { html_test,inject_script } from "../../src/resource";
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

    },
    env: {
        PROJECT_NAME: "cf",
        wasi_output: "wasi_output from cf",

    },
    returnOnExit: false,
}
// function toHexEncodedString(str) {
//     let hexEncoded = "";
//     for (let i = 0; i < str.length; i++) {
//         const char = str[i];
//         const charCode = char.charCodeAt(0);
//         // Encode characters outside the basic ASCII range (0-127) or specific characters if needed
//         if (charCode > 127 || char === '"' || char === '[' || char === ']' || char === ',' || char === '{' || char === '}') {
//             const hexValue = charCode.toString(16).padStart(2, '0');
//             hexEncoded += `\\x${hexValue}`;
//         } else {
//             hexEncoded += char;
//         }
//     }
//     return hexEncoded;
// }
// // Modify and re-encode
// function encodeToHex11(str) {
//     return str.replace(/["\\]/g, ch => `\\x${ch.charCodeAt(0).toString(16).padStart(2, '0')}`);
// }
// function encodeToHex(str) {
//     return str.replace(/[\s\S]/g, ch => {
//         const code = ch.charCodeAt(0);
//         // Encode only non-ASCII or special chars
//         if (code < 32 || code > 126 || ch === '"' || ch === '\\') {
//             return '\\x' + code.toString(16).padStart(2, '0');
//         }
//         return ch;
//     });
// }

// function decodeFromHex(str) {
//     return str.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
//         String.fromCharCode(parseInt(hex, 16))
//     );
// }

// function isHexEncoded(str) {
//     // Checks for common hex escape sequences like \x22 or \\x22
//     return /\\x[0-9A-Fa-f]{2}/.test(str);
//   }

class ContentTextHandler {
    target_host: string;

    constructor(target_host) {
        this.target_host = target_host;
    }

    element(element) {
        // An incoming element, such as `div`
        console.log(`Incoming element: ${element.tagName}`);
    }

    comments(comment) {
        // An incoming comment
    }

    text(text) {

        console.log(`ContentTextHandler: `)
        console.log(text)

        // An incoming piece of text
    }
}

export async function fetch_proxy(context) {
    const { request, env } = context;
    // if (request.method === 'OPTIONS') {
    //     return onRequestOptions();
    //   }


    const url = new URL(request.url);

    console.log(`fetch_proxy preprocess: ${url}`);

    const check_headers = get_headers(request.headers);
    console.log(check_headers)

    const instance = get_instance(html_test_execOptions, html_test);

    //wasm

    const { memory, _exit, mem_alloc, mem_addr, mem_size, change_string, process_html_req } = instance.exports;
    const memory_array = memory as WebAssembly.Memory;

    const mem_alloc_f = mem_alloc as CallableFunction;
    const mem_addr_f = mem_addr as CallableFunction;
    const mem_size_f = mem_size as CallableFunction;
    const change_string_f = change_string as CallableFunction;
    const process_html_req_f = process_html_req as CallableFunction;



    interface MemInfo {
        idx: Number
        array: Uint8Array
    }

    function send_string_to_wasm(data: string): MemInfo {
        const data_array = encode_text(data);
        const mem_id = mem_alloc_f(data_array.byteLength);
        const ptr = mem_addr_f(mem_id);
        const size = mem_size_f(mem_id);
        console.log(`ptr:${ptr}, size:${size}`)

        const buffer = get_memory_array(data_array, ptr, memory_array.buffer);
        const result = {
            idx: mem_id,
            array: buffer
        };
        return result;

    }

    function get_string_from_wasm(mem_id: Number): string {
        const ptr = mem_addr_f(mem_id);
        const size = mem_size_f(mem_id);
        console.log(`ptr:${ptr}, size:${size}`)

        const bytes = new Uint8Array(memory_array.buffer, ptr, size);
        const message = new TextDecoder().decode(bytes);
        return message;
    }

    //wasm


    if (url.pathname.startsWith('/proxy/http://') || url.pathname.startsWith('/proxy/https://')) {
        var target_domain = url.pathname.slice(7, url.pathname.length);
        const searchParams = url.searchParams ;

        var target_url = `${target_domain}${searchParams}`;
        console.log(`target_domain: ${target_domain} target_url: ${target_url}`)

        const target_URL = new URL(target_url);
        const target_host = `${target_URL.protocol}//${target_URL.hostname}`
        const proxy_host = `${target_URL.protocol}//${url.host}/proxy`;


        console.log(`proxy_host: ${proxy_host} target_host: ${target_host}, target_url: ${target_url}`)


        function replace_link(el: Element, attr: string) {
            const value = el.getAttribute(attr);
            if (value) {
                if (value.startsWith("http")) {
                    el.setAttribute(attr, `/proxy/${value}`)
                }
                if (value.startsWith("/")) {
                    el.setAttribute(attr, `/proxy/${target_host}/${value}`)
                }
            }
        }
        // function replace_text(text: string, host:string) {
        //     if (text) {
        //         const is_hex = isHexEncoded(text);
        //         console.log(`replace_text raw is_hex: ${is_hex}`)
        //         console.log(text)
        //         if(is_hex){


        //             console.log('replace_text decoded')
        //             const decoded = decodeFromHex(text);
        //             console.log(decoded)

        //             const updated = decoded.replace("http", `${host}/proxy/http`);
        //             console.log('replace_text updated')
        //             console.log(updated)
        //             const encoded = encodeToHex(updated);

        //             console.log('replace_text encoded')
        //             console.log(encoded)
        //             return encoded;
        //         }else{
        //             const updated = text.replace("http", `${host}/proxy/http`);
        //             console.log('replace_text updated')
        //             console.log(updated)
        //             return updated;
        //         }

        //     }
        //     return text;

        // }


        const req_headers = request.headers;
        // req_headers.set('Origin', target_url)
        // req_headers.set('Referer', target_url)

        console.log(`new_req target_url: ${target_url}`)

        const new_req = new Request(target_url, { headers: req_headers });


        const resp = await fetch(new_req);

        const conten_type = resp.headers.has("content-type") ? resp.headers.get("content-type")  :"";

        

        console.log(`conten_type: ${conten_type}`)
           const resp_headers = new Headers(resp.headers);

            resp_headers.set("Access-Control-Allow-Origin", "*");
            resp_headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
            resp_headers.set("Access-Control-Max-Age", "3600");
            resp_headers.set("Access-Control-Allow-Headers", "x-requested-with");
            const status = resp.status;

        if (conten_type.includes('text/html')) {

 


            const inject = "<script>"
                        + "const originalFetch = window.fetch;" 
                        + "window.fetch = async (input, init) => { "
                        + `const proxy_host="${proxy_host}"`
                        + `const target_host="${target_host}"`
                        + "console.log('[Fetch Intercepted] Rewriting:', url); " 
                        + "let url = typeof input === 'string' ? input : input.url; "
                        + "console.log('[Fetch Intercepted] Rewriting:', url); " 
                        + "const fetch_local_regex = /^\/proxy\/[a-zA-Z0-9.-]+\.js$/;" 
                        + "if (fetch_local_regex.test(url)) {" 
                        + "const newUrl = \`https://your-cdn.com${url}`; " 
                        + "console.log('[Fetch Intercepted] Rewriting:', url, '→', newUrl); } " 
                        + "return originalFetch(url, init); }; "
                        + "const originalXHROpen = XMLHttpRequest.prototype.open;"
                        + "XMLHttpRequest.prototype.open = function (method, url, async, user, password) {"
                        + "console.log('[Fetch Intercepted] Rewriting:', url); "
                        + "const fetch_local_regex = /^\/proxy\/[a-zA-Z0-9.-]+\.js$/; "
                        + "if (fetch_local_regex.test(url)) { "
                        + "const newUrl = `https://your-cdn.com${url}`; "
                        + "console.log('[XHR Intercepted] Rewriting:', url, '→', newUrl); }"
                        + "return originalXHROpen.call(this, method, url, async, user, password);};"
                        + "</script>";




                        const inject_data =`<script>${inject_script}</script>` ;


            const html = await resp.text();

            const html_req = JSON.stringify({
                text: html,
                proxy_host: proxy_host,
                target_host: target_host,
                inject:inject_data
            });
            const result = send_string_to_wasm(html_req);
            console.log(`send_string_to_wasm byteOffset:${result.array.byteOffset}, byteLength:${result.array.byteLength}`)

            const resp_idx = process_html_req_f(result.idx);
            // await axiom_logger(html_req);
            const updated_html = get_string_from_wasm(resp_idx);



            // await axiom_logger({
            //     updated_html: updated_html
            // })






            // set imput html
            // console.log(`============trymy_alloc_f html len :${html.length},${html.slice(0, 100)} `);

            // const html_ptr = my_alloc_f(html.length);
            // console.log(`html_ptr ${html_ptr} :${my_get_size_f(html_ptr)}`);

            // const html_memory = getUint8Array(html, html_ptr, memory_array.buffer);
            // console.log(`html len :${html.length},${html.slice(0, 100)} `);

            // console.log(`html_ptr ${html_ptr} :${my_get_size_f(html_ptr)}`);

            // if (html_ptr == 0) {
            //     return new Response(html, {
            //         status: status,
            //         headers: headers
            //     });
            // }
            // // target url
            // const target_host_ptr = my_alloc_f(target_host.length);
            // const target_host_memory = getUint8Array(target_host, target_host_ptr, memory_array.buffer);

            // // proxydomain url
            // const proxy_host_ptr = my_alloc_f(proxy_host.length);
            // const proxy_host_memory = getUint8Array(proxy_host, proxy_host_ptr, memory_array.buffer);

            // console.log(`proxy_host_ptr ${proxy_host_ptr} :${my_get_size_f(proxy_host_ptr)}`);
            // console.log(`target_host_ptr ${target_host_ptr} :${my_get_size_f(target_host_ptr)}`);


            // console.log("=================try run html_rewrite_f");


            // const resp_html_ptr = html_rewrite_f(html_memory.byteOffset, html_memory.byteLength,
            //     proxy_host_memory.byteOffset, proxy_host_memory.byteLength,
            //     target_host_memory.byteOffset, target_host_memory.byteLength);
            // console.log(`get resp_html ${resp_html_ptr}`);

            // if (resp_html_ptr != 0) {
            //     console.log(`get resp_html ${resp_html_ptr},${my_get_size_f(resp_html_ptr)}`);

            //     const resp_html_buffer = new Uint8Array(memory_array.buffer, resp_html_ptr, my_get_size_f(resp_html_ptr));
            //     const resp_html = new TextDecoder().decode(resp_html_buffer);
            //     console.log(`resp resp_html :${resp_html}`);


            //     // console.log(`resp text :${text.slice(0,100)}`);

            //     // console.log(`resp text :${text.slice(0,100)}`);
            //     // console.log(`resp text len :${text.length}`);

            //     // console.log(`resp text_ptr :${text_ptr}`);
            //     // const text_ptr2 = my_alloc_f(text.length + 100);
            //     // console.log(`resp text_ptr ${text_ptr} :${my_get_size_f(text_ptr)}`);
            //     // console.log(`resp text_ptr2 ${text_ptr2} :${my_get_size_f(text_ptr2)}`);

            //     return new Response(resp_html, {
            //         status: status,
            //         headers: headers
            //     });
            // }

            // return new Response(html, {
            //     status: status,
            //     headers: headers
            // });

            // const rewriter = new HTMLRewriter()
            //     .on("script[src]", {
            //         element(el) {
            //             const origin = el.getAttribute("src");

            //             replace_link(el, "src");
            //             const updated = el.getAttribute("src");

            //             console.log(`====AAchagescript[src] ${origin} => ${updated}`);
            //         }
            //     })
            //     .on("link[ref]", {
            //         element(el) { replace_link(el, "ref") }
            //     }).on("link[href]", {
            //         element(el) { replace_link(el, "href") }
            //     })
            //     //img srcset
            //     .on("img[srcset]", {
            //         element(el) {
            //             const origin = el.getAttribute("srcset");
            //             const updated = replace_text(origin, proxy_host)
            //             // replace_link(el, "srcset")
            //             el.setAttribute("srcset", updated);

            //         }
            //     })
            //     .on("img[src]", {
            //         element(el) { replace_link(el, "src") }
            //     }).on("a[href]", {
            //         element(el) { replace_link(el, "href") }
            //     })
            //     // .on("script", {
            //     //     text({ text }) {
            //     //         if (text) {
            //     //             text = replace_text(text, host)
            //     //         }
            //     //     }
            //     // })

            //     .on("style", {
            //         text({ text }) {
            //             if (text) {
            //                 text = replace_text(text, proxy_host)
            //             }
            //         }
            //     })

            //     ;
            //  const new_resp = rewriter.transform(resp);


            return new Response(updated_html, { headers: resp_headers, status: status });
        }

        else if (conten_type.includes('text/javascript')) {
            const text = await resp.text();
            // await axiom_logger({
            //     updated_script: text,
            //     target_url: target_url
            // })
            console.log("script file")

            if (text) {
                // console.log(text);
                // console.log("replace_text script file")

                // const new_text = replace_text(text,host)


                // await axiom_logger({
                //     target_url: target_url,
                //     origin_script: text
                // })

                return new Response(text, { headers: resp_headers, status: status });
            }
            return resp;

        }

        else {
            const text = await resp.text();
            return new Response(text, { headers: resp_headers, status: status });

            // return resp;
        }



    }





    return new Response(` hello fetch_proxy [[pathname]]: ${url.pathname}`);

}
