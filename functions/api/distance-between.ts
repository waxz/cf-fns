
import {load_wasm} from "../../src/utils/load_wasm_web.js";


import { GeoCoordinates } from "../../app-web/src/globe/geoCoordinates.interface";

export async function onRequestPost(context): Promise<Response> {
  const {request} = context;

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
const result = await load_wasm(context, handler);


return new Response(result.toString());

}