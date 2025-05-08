export const onRequestOptions = async () => {
    return new Response(null, {
        status: 204, // No Content
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // Add the methods you want to allow
            'Access-Control-Allow-Headers': '*', // Or specific headers like 'Content-Type'
            'Access-Control-Max-Age': '86400', // How long the preflight response can be cached (in seconds)
        },
    });
};