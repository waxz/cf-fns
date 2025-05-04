
export const onRequest: PagesFunction<Env> = async (context) => {


    const html = "hello index"
    return new Response(html, {
        status: 200,
        headers: {
            "content-type": "text/html;charset=UTF-8",
        },
    });

}