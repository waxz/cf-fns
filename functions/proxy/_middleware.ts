export async function preprocess(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop()?.split('?')[0] || '';
  console.log(`proxy preprocess: ${url}`);

  console.log(`url : ${JSON.stringify(url, null,2)}`);
  const fetch_local_regex = /^\/proxy\/[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)?\.js$/;
  
  const fetch_local = fetch_local_regex.test(url.pathname);
  const is_local = url.pathname == "/proxy" || url.pathname == "/proxy/";

  console.log(`fetch_local ${fetch_local}, ${url.pathname }, ${is_local}`); // true

  if(fetch_local || is_local){
    console.log("proxy normal");

    return context.next();

  }else{
    console.log("proxy reject");
    const target_url = url.pathname;
    if (!target_url.startsWith('http')){
      return new Response(`hello proxy pathname ${url.pathname}}`,{status : 200});
    }


    



  }



  return context.next();
}

export const onRequest = [preprocess];
