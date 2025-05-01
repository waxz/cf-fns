mod utils;

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;
use worker::*;

use std::sync::LazyLock;

 
use js_sys::JsString;
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use log::Level;
use log::info;
fn init_logger(){

    //1
    console_log::init_with_level(Level::Debug);
    

    //2
    wasm_logger::init(wasm_logger::Config::default());

    info!("It works!");
}

#[wasm_bindgen]
pub fn init_lib() {
    // Optional: setup code
    console_error_panic_hook::set_once(); // Optional

    init_logger();

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
pub async fn rs_url( url:&JsString) {

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
pub fn print_buffer(ptr: *mut u8, size: usize) -> u32 {
    info!("print_buffer {:?}, {}!", ptr, size);

    let mut sum = 0;
    unsafe {
        let arr = std::slice::from_raw_parts(ptr, size);

    for i in 0..size{
        sum = sum + (arr[i] as u32);
        console_log!("buffer[{}] = {}, {}",i, arr[i], arr[i] as char);
    }
    }
    sum

}

use std::cell::RefCell;


// Note: static items do not call [`Drop`] on program termination, so this won't be deallocated.
// this is fine, as the OS can deallocate the terminated program faster than we can free memory
// but tools like valgrind might report "memory leaks" as it isn't obvious this is intentional.
use once_cell::unsync::Lazy;

static mut MEMORY_REC: Lazy<RefCell<HashMap<usize, usize>>> = Lazy::new(|| {
    RefCell::new(HashMap::new())
});
struct Global {
    pointer_list: HashMap<usize , usize>,
}
impl Global {
    fn new() -> Self {
        Self {
            pointer_list: HashMap::new(),
        }
    }
}

// static  GLOBAL: Global = Global::new();



use std::alloc::{alloc, dealloc, Layout};
use std::collections::HashMap;
#[wasm_bindgen]
#[no_mangle]
pub unsafe fn my_alloc(size: usize) -> *mut u8 {
    let align = std::mem::align_of::<usize>();
    let layout = Layout::from_size_align_unchecked(size, align);
    let ptr = alloc(layout);
    let k = ptr as usize;
    unsafe {
        MEMORY_REC.borrow_mut().insert(k, size);
    } 
    info!("my_alloc ptr {:?}, {}!", ptr, size);

    ptr
}
#[wasm_bindgen]
#[no_mangle]
pub unsafe fn my_dealloc(ptr: *mut u8) {
    let k = ptr as usize;

    let mut size = 0 ;
    unsafe {
        if let Some(v) = MEMORY_REC.borrow().get(&k){
            size = *v;

        }

        if (size >0){
            my_dealloc_size(ptr,size);
            MEMORY_REC.borrow_mut().remove(&k);
        }

    } 
}

#[wasm_bindgen]
#[no_mangle]
pub unsafe fn my_dealloc_size(ptr: *mut u8, size: usize) {
    let align = std::mem::align_of::<usize>();
    let layout = Layout::from_size_align_unchecked(size, align);
    dealloc(ptr, layout);
}

