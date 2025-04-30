import { greeting } from "../src/greeting";

export async function onRequest(context) {
    return greeting("Pages Functions");
}