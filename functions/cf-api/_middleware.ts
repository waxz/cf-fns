import { Cloudflare } from "cloudflare";

interface Env {
    KV: KVNamespace;
    CLOUDFLARE_API_TOKEN: SecretsStoreSecret,
    CLOUDFLARE_ACCOUNT_ID: SecretsStoreSecret,
    CLOUDFLARE_ACCOUNT_EMAIL: SecretsStoreSecret,

}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const url = new URL(request.url);
    url.searchParams.forEach(function (v, k) {
        console.log(`${k}:${v}`)
    });
    const project_name = url.searchParams.get("project_name");
    const api = url.searchParams.get("api");

    const cloudflare_token = url.searchParams.get("cloudflare_token");
    const cloudflare_account_id = url.searchParams.get("cloudflare_account_id");


    if (!project_name || !api) {
        return context.next();
    }

    const CLOUDFLARE_API_TOKEN = context.env.CLOUDFLARE_API_TOKEN;
    const CLOUDFLARE_ACCOUNT_ID = context.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_ACCOUNT_EMAIL = context.env.CLOUDFLARE_ACCOUNT_EMAIL;

    console.log(`CLOUDFLARE_API_TOKEN : ${CLOUDFLARE_API_TOKEN}, CLOUDFLARE_ACCOUNT_ID :${CLOUDFLARE_ACCOUNT_ID}, CLOUDFLARE_ACCOUNT_EMAIL: ${CLOUDFLARE_ACCOUNT_EMAIL}`);


    const client = new Cloudflare({
        apiToken: CLOUDFLARE_API_TOKEN,
    });

    const project = await client.pages.projects.get(project_name, {
        account_id: CLOUDFLARE_ACCOUNT_ID,
    });

    console.log(`client.pages.projects.get(${project_name}) : ${JSON.stringify(project, null, 2)}`);



    if (api == "client.pages.projects.deployments.history.logs.get") {

        var lateast_deployment;
        // Automatically fetches more pages as needed.
        for await (const deployment of client.pages.projects.deployments.list(project_name, {
            account_id: CLOUDFLARE_ACCOUNT_ID,
        })) {
            lateast_deployment = deployment;
            console.log(`client.pages.projects.deployments.list(${project_name}) : ${JSON.stringify(deployment, null, 2)}`);
            break;
       
        }
        if(lateast_deployment){
            console.log(`lateast_deployment(${project_name}) : ${JSON.stringify(lateast_deployment, null, 2)}`);
        
        
            const log = await client.pages.projects.deployments.history.logs.get(
                project_name,
                lateast_deployment.id,
                { account_id: CLOUDFLARE_ACCOUNT_ID },
              );
              console.log(`====================log`);
              console.log(log.data);
              console.log(`log : ${JSON.stringify(log, null, 2)}`);

        }



    }

    return context.next();
    ;
}