
export function print_request(context) {
    const { request, env } = context;
    const url = new URL(request.url);
  
    const headers = {};
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value;
    }
  
    console.log(`auth received URL: ${url}`);
    console.log(`Protocol: ${url.protocol}`);
    console.log(`Pathname: ${url.pathname}`);
    console.log(`Password: ${url.password}`);
    console.log(`All Headers: ${JSON.stringify(headers, null, 2)}`);
  
    //If you're testing this behind a reverse proxy (or even some local dev tools), the incoming request's URL might appear to be http:// even if the user used HTTPS—because the proxy stripped that detail and forwarded it via this header.
    const xForwardedProto = request.headers.get("x-forwarded-proto");
    console.log(`x-forwarded-proto: ${xForwardedProto}`);
  
  }