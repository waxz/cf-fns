#[no_mangle]
pub extern "C" fn multiply(v1: i32, v2: i32, v3: i32) -> i32 {
    v1 * v2 *v3
}

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! This is Rust running in Workers WASI.", name)
}

use std::env;
use std::fs::File;
use std::io::{self, Read, Write};

 

#[no_mangle]
pub extern "C" fn run() {
    println!("Hello from Rust WASI in Cloudflare Pages!");
 
}