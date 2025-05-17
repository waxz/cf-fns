interface Env {
  KV: KVNamespace;
  DB: D1Database;
}


import { axiom_logger } from "../../src/utils/axiom"

async function logRequest(request: Request) {

  let body = {};
  if (request.method == "POST") {
    const clonedRequest = request.clone(); // Clone it to safely read the body

    try {
      body = await request.json(); // Safely parse JSON body
    } catch (e) {
      body = { error: "Invalid JSON", raw: await clonedRequest.text() };
    }
  }


  await axiom_logger({
    event: "log",
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    body: body
  });
}



export const on_get = async (context) => {
  const { request, env } = context;

  await logRequest(request);



  return new Response(JSON.stringify({ status: "ok" }),

    {
      status: 200,
      headers: {
        "content-type": "text/json"
      }
    }

  );


};
export const on_post = async (context) => {
  const { request, env } = context;

  await logRequest(request);


  return new Response(JSON.stringify({ status: "ok" }),

    {
      status: 200,
      headers: {
        "content-type": "text/json"
      }
    }

  );


};

export const onRequestGet = [on_get];
export const onRequestPost = [on_post];