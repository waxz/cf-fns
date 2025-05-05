

import { encode_sha256 } from "../../src/utils/encode";

import html from "../../public/dist/login/redirect.html";

import {template_replace} from "../../src/utils/template_replace";

const AUTH_SECRET = "50c563902e9a13148a61fc8b1ecf36f2922debeb5d775ebd1693f41076ed3b51";
const AUTH_SECRET_COOKIE = "__auth_secret__";


//https://developers.cloudflare.com/workers/runtime-apis/headers/#differences

export function checkCookiesLogin(cookie:Record<string,any>){
  return cookie.hasOwnProperty(AUTH_SECRET_COOKIE) && cookie[AUTH_SECRET_COOKIE]==AUTH_SECRET;
}

export function checkCookiesLoginexist(headers:Headers){
  return headers.has("cookie") && headers.get('cookie').includes(`${AUTH_SECRET_COOKIE}=${AUTH_SECRET}`);
}



export async function getFormData(context) {

  try {
    let input = await context.request.formData();

    // Convert FormData to JSON
    // NOTE: Allows multiple values per key
    let output = {};
    for (let [key, value] of input) {
      let tmp = output[key];
      if (tmp === undefined) {
        output[key] = value;
      } else {
        output[key] = [].concat(tmp, value);
      }
    }

    let pretty = JSON.stringify(output, null, 2);
    console.log(pretty);
    return output;
  } catch (err) {
    return {};
  }

}

export function getCookies(context) {
  const { request, env } = context;
  const headers = request.headers;
  const cookie = headers.get('cookie');
  console.log(`headers : ${headers}`);

  console.log(`cookie : ${cookie}`);
  const cookie_dict = cookie.split(";").reduce(function (d, v) { var p = v.split("="); d[p[0].trim()] = p[1]; return d; }, {});

  return cookie_dict;
}


export function onRequestGetCheckCookie(context) {
  const { request, env } = context;
  const headers = request.headers;

  const cookie_dict = getCookies(context);

  if (cookie_dict.hasOwnProperty(AUTH_SECRET_COOKIE)) {
    return cookie_dict[AUTH_SECRET_COOKIE] == AUTH_SECRET;
  } else {
    return false;
  }
}




export async function onRequestPost(context) {
  const { request, env } = context;


  const form = await getFormData(context);
  var username = form["username"];
  var password = form["password"];
  var login_status = "failed";

  const headers = new Headers();
  headers.set("Strict-Transport-Security","max-age=63072000; includeSubDomains; preload" );
  headers.set("content-type","text/html;charset=UTF-8");

  if (form.hasOwnProperty("username") && form.hasOwnProperty("password")) {
    username = form["username"];
    password = form["password"];

    const encode = await encode_sha256(`${username}:${password}`);

    var now = new Date();
    var time = now.getTime();
    var expireTime = time + 1000*36000*10;
    now.setTime(expireTime);
    headers.append(`Set-Cookie`, `${AUTH_SECRET_COOKIE}=${encode};Path=/;expires=${now.toUTCString()}`);

  
    // console.log(`encode : ${encode}`);
    // console.log(`AUTH_SECRET : ${AUTH_SECRET}`);

    if (encode == AUTH_SECRET) {
      login_status = "successful";
    }
  }

  const replacements = {
    login_status: login_status,
  };
  
  const resepond_html = template_replace(html,replacements);
  console.log(resepond_html);


  return new Response(resepond_html, {
    status:200,
    headers:headers,
  });
}