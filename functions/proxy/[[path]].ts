export async function preprocess(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const ext = url.pathname.split('.').pop()?.split('?')[0] || '';
    const fetch_local_regex = /^\/proxy\/[a-zA-Z0-9.-]+\.js$/;

    const fetch_local = fetch_local_regex.test(url.pathname);
    const is_local = url.pathname == "/proxy" || url.pathname == "/proxy/";

    console.log(`fetch_local ${fetch_local}, ${url.pathname}, ${is_local}`); // true


    if (is_local || fetch_local) {
        return context.next();
    }


    return new Response(` hello proxy [[pathname]]: ${url.pathname}`);
}
export const onRequest = [preprocess];
