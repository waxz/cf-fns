interface Env {
    KV: KVNamespace;
    CLOUDFLARE_API_TOKEN: SecretsStoreSecret,
    CLOUDFLARE_ACCOUNT_ID: SecretsStoreSecret,
    CLOUDFLARE_ACCOUNT_EMAIL: SecretsStoreSecret,
    AXIOM_TOKEN: SecretsStoreSecret,
    AXIOM_DATASET: SecretsStoreSecret,
    AXIOM_ORG_ID: SecretsStoreSecret,
}

// import { Logger, AxiomJSTransport, ConsoleTransport } from "@axiomhq/logging";
import { Axiom } from "@axiomhq/js";

import { LogLayer } from "loglayer";
import { AxiomTransport } from "@loglayer/transport-axiom";
import { serializeError } from "serialize-error";
import { Axiom } from "@axiomhq/js";



export let axiom;
export let axiom_logger;

let dataset;
let token;
let orgId;

export async function sendDataToAxiom(datasetName, axiomToken, data) {
    const apiUrl = `https://api.axiom.co/v1/datasets/${datasetName}/ingest`; // Use api.eu.axiom.co for EU region
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${axiomToken}`,
                'Content-Type': 'application/json' // Or 'application/x-ndjson' for newline-delimited JSON
            },
            body: JSON.stringify(data) // Data should be an array of JSON objects for application/json
            // For application/x-ndjson, the body should be a string with each JSON object on a new line
            // Example for x-ndjson: body: data.map(item => JSON.stringify(item)).join('\n')
        });

        if (response.ok) {
            console.log('Data successfully sent to Axiom!');
            // You might want to check the response body for more details if needed
            const result = await response.json();
            console.log('Response:', result);
        } else {
            const errorBody = await response.text();
            console.error(`Failed to send data to Axiom: ${response.status} - ${response.statusText}`, errorBody);
        }
    } catch (error) {
        console.error('Error sending data to Axiom:', error);
    }
}


export async function init_client(context) {



    if (!axiom) {
        dataset = context.env.AXIOM_DATASET;
        token = context.env.AXIOM_TOKEN;
        orgId = context.env.AXIOM_ORG_ID;

        console.log(`token: ${token}, dataset: ${dataset},orgId:${orgId}`);

        await sendDataToAxiom(dataset,token,[{msg:"hello sendDataToAxiom"}]);


        axiom = new Axiom({
            token: token,
            orgId: orgId,
            onError: (err) => {
                console.error('ERROR:', err);
            }
        });
        await axiom.ingest(dataset, [{ foo: 'bar' }]);
        // Create the LogLayer instance with AxiomTransport
        // logger = new LogLayer({
        //     errorSerializer: serializeError,
        //     transport: new AxiomTransport({
        //         logger: axiom,
        //         dataset: dataset,
        //     }),
        // });

        // Start logging
        // logger.info("Hello from LogLayer!");

        axiom_logger = async function (data) {

            await axiom.ingest(dataset, data);
            await axiom.flush();

        }

        // console.log("====ingest")
        // await logger([{ foo: 'bar' }]);
        // const res = await axiom.query(`[${dataset}] | take 10`);

        // console.log(`axiom res: ${res}`);

        await axiom.ingest(dataset, [{msg:"hello axiom1"}]);
        await axiom.ingest(dataset, {msg:"hello axiom2"});
        await axiom_logger({msg:"hello axiom3"});
        await axiom.flush();
        await axiom_logger({msg:"app started"});


    }

}