
import {fetch_cache} from "./fetch"
import { kv_get,kv_put } from "./kv";

export async function getGfwText(context) {
    var url = "https://pagure.io/gfwlist/raw/master/f/gfwlist.txt";
    // in cf cache
    url = "https://raw.githubusercontent.com/waxz/gfwlist/refs/heads/master/gfwlist.txt";
    const req = new Request(url);
    const gfwlist = await fetch_cache(req, context);
    const gfwlist_text = await gfwlist.text();
    const gfwlistText = atob(gfwlist_text);
    return gfwlistText;
}
export async function getGfwTextCached(context, force:boolean): Promise<string>{
    let gfwlistText = await kv_get(context, "gfwlistText");
    let gfwlistTextStamp = await kv_get(context, "gfwlistTextStamp");
  
    const now = Date.now();
    var nedd_update = force;

    if (gfwlistText && gfwlistTextStamp) {
      const age = now - Number(gfwlistTextStamp);
      nedd_update = force || (age > 24 * 60 * 60 * 1000);
      
    }

    if (nedd_update) { // 1 d in milliseconds
        gfwlistText = await getGfwText(context);
        await kv_put(context, "gfwlistText", gfwlistText);
        await kv_put(context, "gfwlistTextStamp", now.toString());
      }

    return gfwlistText;
}

