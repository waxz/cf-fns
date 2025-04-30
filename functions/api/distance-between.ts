import * as wasm from "../../app-rust/pkg/src_wasm_bg.js";
// @ts-ignore
import wasmModule from "../../app-rust/pkg/src_wasm_bg.wasm";

import { GeoCoordinates } from "../../app-web/src/globe/geoCoordinates.interface";

export async function onRequestPost({ request }): Promise<Response> {
  const { from, to } = await request.json() as { from: GeoCoordinates; to: GeoCoordinates };

  try {
    const imports = {
      "./src_wasm_bg.js": wasm,
    };

    const result = await WebAssembly.instantiate(wasmModule, imports);

    if (!result) {
      console.error("WebAssembly instantiation failed (no result):", result);
      return new Response("Error instantiating WebAssembly", { status: 500 });
    }

    wasm.__wbg_set_wasm(result.exports); // Try accessing exports directly from 'result'

    const distanceBetween = wasm.distance_between(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );
    return new Response(distanceBetween.toString());
  } catch (error) {
    console.error("Error using WebAssembly:", error);
    return new Response("Error calculating distance", { status: 500 });
  }
}