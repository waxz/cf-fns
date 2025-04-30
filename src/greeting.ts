import html from "./greeting_html.html";

import {template_replace} from "./utils/template_replace";

export function greeting(name: string): Response {
  console.log(html);


  const replacements = {
    name: name,
  };
  
  const resepond_html = template_replace(html,replacements);




  console.log(resepond_html);


  return new Response(resepond_html, {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });


}