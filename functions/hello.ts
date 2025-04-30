import { greeting } from "../src/greeting";
// import html from "../src/greeting_html.html";

interface Env {
    KV: KVNamespace;
  }

  
export async function onRequest(context:ExecutionContext) {
    // const {request} = context;
    

    return greeting("Pages Functions");
    // return new Response(
    //     html,
    //     {
    //       headers: { "Content-Type": "text/html" }
    //     }
    //   );
}