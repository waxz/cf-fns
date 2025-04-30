import html from '../app-web/src/login.html';

import {template_replace} from "../src/utils/template_replace";

import  {encode_sha256} from  "../src/utils/encode";

const AUTH_SECRET = "50c563902e9a13148a61fc8b1ecf36f2922debeb5d775ebd1693f41076ed3b51";
const AUTH_SECRET_COOKIE = "__auth_secret__";


export async function getFormData(context){

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

export function getCookies(context){
  const {request,env} = context;
  const headers = request.headers;
  const cookie = headers.get('cookie');
  console.log(`headers : ${headers}`);

  console.log(`cookie : ${cookie}`);
  const cookie_dict = cookie.split(";").reduce(function (d, v){ var p = v.split("=");   d[p[0].trim()] = p[1]; return d;  },{});

  return cookie_dict;
}


export function onRequestGetCheckCookie(context) {
  const {request,env} = context;
  const headers = request.headers;

  const cookie_dict = getCookies(context);

  if (cookie_dict.hasOwnProperty(AUTH_SECRET_COOKIE)){
    return cookie_dict[AUTH_SECRET_COOKIE] == AUTH_SECRET;
  }else{
    return false;
  }
}




export async function onRequestGet(context) {
  const {request,env} = context;
  const headers = request.headers;

 

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
}

export async function onRequestPost(context) {
  const {request,env} = context;
  

  const form = await getFormData(context);
  var username = form["username"];
  var password = form["password"];
  if (form.hasOwnProperty("username") && form.hasOwnProperty("password")){
    username = form["username"];
     password = form["password"];

     const encode = await encode_sha256(`${username}:${password}`);

  console.log(`encode : ${encode}`);
  console.log(`AUTH_SECRET : ${AUTH_SECRET}`);

     if(encode == AUTH_SECRET){
      return new Response(`login ok with username: ${username}, password: ${password} `, {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
      });
     }


  }





  return new Response(`login with username: ${username}, password: ${password} `, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}