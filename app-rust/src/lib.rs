mod utils;

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;
use worker::*;



 
use js_sys::JsString;
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


#[wasm_bindgen(start)]
pub fn main() {
    // Optional: setup code
    console_error_panic_hook::set_once(); // Optional
}



#[wasm_bindgen]
pub fn distance_between(from_latitude_degrees: f64, from_longitude_degrees: f64, to_latitude_degrees: f64, to_longitude_degrees: f64) -> f64 {
    let earth_radius_kilometer = 6371.0_f64;

    let from_latitude = from_latitude_degrees.to_radians();
    let to_latitude = to_latitude_degrees.to_radians();

    let delta_latitude = (from_latitude_degrees - to_latitude_degrees).to_radians();
    let delta_longitude = (from_longitude_degrees - to_longitude_degrees).to_radians();

    let central_angle_inner = (delta_latitude / 2.0).sin().powi(2)
        + from_latitude.cos() * to_latitude.cos() * (delta_longitude / 2.0).sin().powi(2);
    let central_angle = 2.0 * central_angle_inner.sqrt().asin();

    let distance = earth_radius_kilometer * central_angle;
    
    return distance;
}

#[wasm_bindgen]
pub fn rs_add(a:f64, b:f64) -> f64{

    console_log!("rs_add: a = {}, b = {}",a,b);
    a+b
}

#[wasm_bindgen]
pub async fn rs_url( url:JsString) {

    console_log!("rs_url, url = {}", url);
    
}


static mut CHAR_BUFFER: [u8; 1000] = [0; 1000];

#[wasm_bindgen]
pub fn get_char_buffer_ptr() -> *const u8 {
    unsafe { CHAR_BUFFER.as_ptr() }
}

#[wasm_bindgen]
pub fn get_char_buffer_len() -> usize {
    1000
}

#[wasm_bindgen]
pub fn print_buffer() -> u32 {
    unsafe {
        (CHAR_BUFFER[0] as u32) + (CHAR_BUFFER[1] as u32)
    }
}