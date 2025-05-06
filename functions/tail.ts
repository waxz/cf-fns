import {Cloudflare} from "cloudflare";

interface Env {
    KV: KVNamespace;
    CLOUDFLARE_API_TOKEN:SecretsStoreSecret,
    CLOUDFLARE_ACCOUNT_ID:SecretsStoreSecret,
    CLOUDFLARE_ACCOUNT_EMAIL:SecretsStoreSecret,
  
  }

export const onRequest: PagesFunction<Env> = async (context) => {
    const {request,env} = context;

    const CLOUDFLARE_API_TOKEN = context.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ACCOUNT_ID = context.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_ACCOUNT_EMAIL = context.env.CLOUDFLARE_ACCOUNT_EMAIL;
  
    console.log(`CLOUDFLARE_API_TOKEN : ${CLOUDFLARE_API_TOKEN}, CLOUDFLARE_ACCOUNT_ID :${CLOUDFLARE_ACCOUNT_ID}, CLOUDFLARE_ACCOUNT_EMAIL: ${CLOUDFLARE_ACCOUNT_EMAIL}`);
    const client = new Cloudflare({
          apiToken: CLOUDFLARE_API_TOKEN,
      });
  

    return context.next();
}