import { onRequestOptions } from "../../src/utils/response"


export async function fetch_proxy(context) {
    const { request, env } = context;
    // if (request.method === 'OPTIONS') {
    //     return onRequestOptions();
    //   }


    const url = new URL(request.url);


    if (url.pathname.startsWith('/proxy/http://') || url.pathname.startsWith('/proxy/https://')) {
        var target_url = url.pathname.slice(7, url.pathname.length);



        const new_req = new Request(target_url, { ...request });

        const  resp = await fetch(new_req);
        const rewriter = new HTMLRewriter()
            .on("script[src]", {
                element(el) { 
                    const attr = "src";
                    const value = el.getAttribute(attr);
                    if (value && value.startsWith("http")){
                        el.setAttribute(attr, `/${attr}`)
                    }
                }
            });

        const new_resp = rewriter.transform(resp)

        return new_resp;
    }





    return new Response(` hello fetch_proxy [[pathname]]: ${url.pathname}`);

}
