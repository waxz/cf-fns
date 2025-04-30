import * as wasm from "../../app-rust/pkg/src_wasm_bg.js";
// @ts-ignore
import wasmModule from "../../app-rust/pkg/src_wasm_bg.wasm";


import {load_wasm} from "../../src/utils/load_wasm.js";

import { GeoCoordinates } from "../../app-web/src/globe/geoCoordinates.interface";

export async function onRequestPost({ request }): Promise<Response> {
  const { from, to } = await request.json() as { from: GeoCoordinates; to: GeoCoordinates };


  const handler = async (wasm: any) => {
    const distanceBetween = wasm.distance_between(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );
    return distanceBetween;
  };
const result = await load_wasm(handler);


return new Response(result.toString());

}