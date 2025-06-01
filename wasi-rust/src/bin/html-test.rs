use serde::{Deserialize, Serialize};

// use serde_json::{Result, Value};

#[derive(Serialize, Deserialize)]
struct HtmlReq {
    text: String,
    proxy_host: String,
    target_host: String,
    inject: String,
}

#[no_mangle]
pub extern "C" fn process_html_req(idx: usize) -> usize {
    let ptr = nx_mem::simple_alloc::mem_addr(idx);
    let size = nx_mem::simple_alloc::mem_size(idx);

    if ptr == 0 || size == 0 {
        return 0;
    }
    let req: String = unsafe { String::from_raw_parts(ptr as *mut u8, size, size) };

    if let Ok(req) = serde_json::from_str::<HtmlReq>(req.as_str()) {
        let html: String = nx_html::my_html_rewrite(
            &req.text.as_str(),
            req.proxy_host.as_str(),
            req.target_host.as_str(),
            req.inject.as_str(),
        );

        let index = nx_mem::simple_alloc::mem_store(html.as_ptr(), html.as_bytes().len());
        std::mem::forget(html);
        index
    } else {
        0
    }
}

#[no_mangle]
pub extern "C" fn change_string(ptr: *mut u8, size: usize) -> usize {
    let s1 = unsafe { String::from_raw_parts(ptr, size, size) };

    let s2 = format!("hello {}, ptr:{:?}, size:{}", s1, ptr, size);

    let index = nx_mem::simple_alloc::mem_store(s2.as_ptr(), s2.as_bytes().len());
    std::mem::forget(s2);
    index
}

#[no_mangle]
pub extern "C" fn dummy() {
    let idx = nx_mem::simple_alloc::mem_alloc(128);

    println!(
        "idx: {}, addr: {}, size: {}",
        idx,
        nx_mem::simple_alloc::mem_addr(idx),
        nx_mem::simple_alloc::mem_size(idx)
    )
}

// #[no_mangle]
// pub extern "C" fn init_main_memory_buffer() -> usize {
//     if unsafe { !MY_TA_BUFFER_INIT } {
//         let mut zero_vec = vec![0u8; MY_TA_BUFFER_SIZE];
//         let base = zero_vec.as_mut_ptr();
//         std::mem::forget(zero_vec);

//         nx_mem::ta_alloc::my_init_buffer(
//             // unsafe { &raw mut MY_TA_BUFFER } as *mut u8,
//             base,
//             MY_TA_BUFFER_SIZE,
//         );

//         unsafe { MY_TA_BUFFER_INIT = true };
//     }

//     1 as usize
// }

use std::fs::File;
use std::io::Read;

pub fn read_file(path: &str) -> String {
    let mut f = File::open(path).unwrap();
    let mut s = String::new();
    match f.read_to_string(&mut s) {
        Ok(_) => s,
        Err(e) => e.to_string(),
    }
}
// Add this to ensure memory is exported automatically
// #[no_mangle]
// pub static mut __heap_base: u8 = 0;
// #[no_mangle]
// pub extern "C" fn html_rewrite(
//     html_ptr: *const u8,
//     html_len: usize,
//     proxy_host_ptr: *const u8,
//     proxy_host_len: usize,
//     target_host_ptr: *const u8,
//     target_host_len: usize,
// ) -> *const u8 {
//     let html = unsafe { String::from_raw_parts(html_ptr as *mut u8, html_len, html_len) };

//     let proxy_host = unsafe {
//         String::from_raw_parts(proxy_host_ptr as *mut u8, proxy_host_len, proxy_host_len)
//     };

//     let target_host = unsafe {
//         String::from_raw_parts(target_host_ptr as *mut u8, target_host_len, target_host_len)
//     };

//     let html = nx_html::my_html_rewrite(html.as_str(), proxy_host.as_str(), target_host.as_str());

//     let resp_html_ptr = nx_mem::ta_alloc::my_alloc(html.len()) as *mut u8;

//     // unsafe {
//     //     std::ptr::copy(html.as_ptr(), resp_html_ptr as *mut _, html.len());
//     // }

//     let buf = unsafe { std::slice::from_raw_parts_mut(resp_html_ptr, html.len()) };
//     // println!(" buf len : {}", buf.len());
//     buf.copy_from_slice(html.as_bytes());
//     // std::mem::forget(html);

//     resp_html_ptr
// }

static MY_TA_BUFFER_SIZE: usize = 1024 * 1024 * 2;
static mut MY_TA_BUFFER: [u8; MY_TA_BUFFER_SIZE] = [0; MY_TA_BUFFER_SIZE];
// static mut MY_TA_BUFFER_INIT: bool = false;
fn main() -> std::io::Result<()> {
    let html = r#"
<!DOCTYPE html>
<html>
    <head>
        <title>Functions : powered by cloudflare</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="shortcut icon" href="/_layouts/15/images/odbfavicon.ico?rev=47" type="image/vnd.microsoft.icon" id="favicon">
        <script type="module">
            //https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
            function deleteAllcookies(){
                console.log("deleteAllcookies");
                document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
            }
            function logout(){
                console.log("logout");

                deleteAllcookies();

            }
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
              }

            var current_url = new URL(document.URL);

              
        </script>
        <style>
        @font-face{font-family:'BBC Reith Sans';
        font-display:block;font-weight:300;
        src:url(https://static.files.bbci.co.uk/fonts/reith/2.512/BBCReithSans_W_Lt.woff2) ;
        src:url(/BBCReithSans_W_Lt.woff2) ;

        </style>
    </head>
    <body>
        <p>==== Nav ====</p>
        {nav}
        <a href="aa">aa</a>
        <img srcset="https://ichef.bbci.co.uk/news/240/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 240w,https://ichef.bbci.co.uk/news/320/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 320w,https://ichef.bbci.co.uk/news/480/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 480w,https://ichef.bbci.co.uk/news/640/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 640w,https://ichef.bbci.co.uk/news/800/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 800w,https://ichef.bbci.co.uk/news/1024/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 1024w,https://ichef.bbci.co.uk/news/1536/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 1536w" > test </img>
        <img src="https://ichef.bbci.co.uk/news/240/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp" > test </img>
    </body>
</html>

    

"#;

    let proxy_host = "https://abc.com/proxy".to_string();
    let target_host = "https://www.bbc.com".to_string();

    let html: String = nx_html::my_html_rewrite(html, proxy_host.as_str(), target_host.as_str(),"<script> alert(123)</script>");

    println!("resp_html:{:?}", html);

    let d = unsafe { &mut MY_TA_BUFFER[1] };
    *d = 100;

    println!("base      ptr:{:?}", &raw mut MY_TA_BUFFER as *mut u8);
    println!("basesize  ptr:{:?}", &MY_TA_BUFFER_SIZE as *const usize);
    println!("d         ptr:{:?}", d as *mut u8);

    let mut vbuf = [0_u8; 10000];
    let resp_html_ptr = vbuf.as_mut_ptr();
    println!("resp_html_ptr:{:?}", resp_html_ptr);

    let buf = unsafe { std::slice::from_raw_parts_mut(resp_html_ptr, html.len()) };
    println!(" buf len : {}", buf.len());
    // buf.copy_from_slice (html.as_bytes());
    //     for (i,j) in  html.as_bytes().iter().enumerate(){
    // buf[i] = *j;
    //     }
    println!(" buf copy ok");

    // std::mem::forget(html);
    // unsafe {
    //     std::ptr::copy(html.as_bytes().as_ptr(), resp_html_ptr as *mut _, 100);
    // }
    Ok(())
}
