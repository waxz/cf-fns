


interface Env {
    KV: KVNamespace;
  }


export async function kv_get(context, k)  {
  return await context.env.KV.get(k);
}

export async function kv_put(context, k, v) {
  return await context.env.KV.put(k,v);
}