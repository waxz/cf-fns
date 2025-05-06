interface Env {
    KV: KVNamespace;
    DB:D1Database;
  }

export const onRequest = async ({ env }) => {
    try {
      const { results } = await env.DB
        .prepare("SELECT timestamp, message FROM logs ORDER BY timestamp DESC LIMIT 100") // Fetch the latest 100 logs
        .all();
  
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };