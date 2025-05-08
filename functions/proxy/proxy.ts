import { onRequestOptions } from "../../src/utils/response"

class ContentTextHandler {
    target_host: string;

     constructor(target_host){
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
        function replace_text(text:string) {
            if(text){
                console.log('replace_text')
                console.log(text)
                var new_text = text.replace("http",`${host}/proxy/http`);
                console.log('new_text')
                console.log(new_text)
                return new_text;
            }
            return text;
           
        }



        const new_req = new Request(target_url, { ...request });


        const resp = await fetch(new_req);
        const conten_type = resp.headers.get("content-type");


        if (conten_type.includes('text/html')){
            const rewriter = new HTMLRewriter()
            .on("script[src]", {
                element(el) { 
                    replace_link(el, "src") ;
                }
            })
            .on("link[ref]", {
                element(el) { replace_link(el, "ref") }
            }).on("link[href]", {
                element(el) { replace_link(el, "href") }
            })
            //img srcset
            .on("img[srcset]", {
                element(el) { replace_link(el, "srcset") }
            })
            .on("img[src]", {
                element(el) { replace_link(el, "src") }
            }).on("a[href]", {
                element(el) { replace_link(el, "href") }
            }).on("script",{
                text({text}) { 
                    const regular_sting = text;
                    console.log("script text")
                    text = replace_text(regular_sting)
                 }
            })
            ;

        const new_resp = rewriter.transform(resp)

        return new Response(new_resp.body, { ...resp });
        }else if (conten_type.includes('text/javascript')) {
            const text = await resp.text();
            
            console.log("script file")

            if(text){
                    console.log(text); 
            const new_text = replace_text(text)
            return new Response(new_text, { ...resp });

            }
            return resp;




        }


 
    }





    return new Response(` hello fetch_proxy [[pathname]]: ${url.pathname}`);

}
