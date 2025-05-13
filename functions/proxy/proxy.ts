import { onRequestOptions } from "../../src/utils/response"
import { encodeToHex, decodeFromHex, isHexEncoded, replace_text } from "../../src/utils/encode"

import {get_instance,ExecOptions} from "../../src/utils/wasi_common"
import { wasi_test,html_test } from "../../src/resource";
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


 const instance = get_instance(html_test_execOptions, html_test);
  const { memory,my_init,my_alloc,my_get_size} = instance.exports;
          const memory_array = memory as WebAssembly.Memory;
          const my_init_f = my_init as CallableFunction;
          const my_alloc_f = my_alloc as CallableFunction;
          const my_get_size_f = my_get_size as CallableFunction;

const init_ok = my_init_f();

   console.log(`my_init_f init_ok ${init_ok}`)
const init_ok2 = my_init_f();

   console.log(`my_init_f init_ok2 ${init_ok2}`)
 
    if (url.pathname.startsWith('/proxy/http://') || url.pathname.startsWith('/proxy/https://')) {
        var target_url = url.pathname.slice(7, url.pathname.length);
        const target_URL = new URL(target_url);
        const target_host = `${target_URL.protocol}//${target_URL.hostname}`
        const host = `${url.protocol}//${url.hostname}`


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



        const new_req = new Request(target_url, { ...request });


        const resp = await fetch(new_req);
        
        const conten_type = resp.headers.get("content-type");


        if (conten_type.includes('text/html')) {

            const headers = resp.headers;
            const status = resp.status;
            const text = await resp.text();

            console.log(`resp text :${text.slice(0,100)}`);

            const text_ptr = my_alloc_f(text.length);
            console.log(`resp text_ptr :${text_ptr}`);
            const text_ptr2 = my_alloc_f(text.length + 100);
            console.log(`resp text_ptr ${text_ptr} :${my_get_size_f(text_ptr)}`);
            console.log(`resp text_ptr2 ${text_ptr2} :${my_get_size_f(text_ptr2)}`);

           return new Response(text, { 
            status:status,
            headers:headers
        });


            // const rewriter = new HTMLRewriter()
            //     .on("script[src]", {
            //         element(el) {
            //             replace_link(el, "src");
            //         }
            //     })
            //     .on("link[ref]", {
            //         element(el) { replace_link(el, "ref") }
            //     }).on("link[href]", {
            //         element(el) { replace_link(el, "href") }
            //     })
            //     //img srcset
            //     .on("img[srcset]", {
            //         element(el) { replace_link(el, "srcset") }
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
            //                 text = replace_text(text, host)
            //             }
            //         }
            //     })

            //     ;

            // const new_resp = rewriter.transform(resp)

            // return new Response(new_resp.body, { ...resp });
        } 
        
        // else if (conten_type.includes('text/javascript')) {
        //     const text = await resp.text();

        //     console.log("script file")

        //     if (text) {
        //         console.log(text);
        //         console.log("replace_text script file")

        //         const new_text = replace_text(text,host)
        //         return new Response(new_text, { ...resp });
        //     }
        //     return resp;

        // } 
        
        else {
            return resp;
        }



    }





    return new Response(` hello fetch_proxy [[pathname]]: ${url.pathname}`);

}
