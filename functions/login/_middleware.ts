import {onRequestPost as on_login_post} from "./auth";

export async function preprocess(context) {
  const { request, env } = context;

  // fallback for other requests
  return env.ASSETS.fetch(request);
}


export const onRequestGet = [preprocess];
export const onRequestPost = [on_login_post];
