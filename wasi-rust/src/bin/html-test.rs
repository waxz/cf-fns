// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// use alloc_cat::{ALLOCATOR, AllocCat};

// #[global_allocator]
// pub static GLOBAL_ALLOCATOR: &AllocCat = &ALLOCATOR;

const MEMORY_MAX_SIZE: usize = 200;
static mut MEMORY_INDEX: usize = 0;
static mut MEMORY_ADDR: [usize; MEMORY_MAX_SIZE] = [0; MEMORY_MAX_SIZE];
static mut MEMORY_SIZE: [usize; MEMORY_MAX_SIZE] = [0; MEMORY_MAX_SIZE];

#[no_mangle]
pub extern "C" fn mem_addr(i: usize) -> usize {
    unsafe { MEMORY_ADDR[i] }
}

#[no_mangle]
pub extern "C" fn mem_size(i: usize) -> usize {
    unsafe { MEMORY_SIZE[i] }
}
#[no_mangle]
pub extern "C" fn mem_store(ptr:*const u8, size:usize)->usize{
    let index = unsafe { MEMORY_INDEX };
    let old_size = mem_size(index);

    if old_size > 0{
        mem_drop(index);
    }
        unsafe {
        MEMORY_SIZE[index] = size;

        MEMORY_ADDR[index] = ptr as usize;
    }

    unsafe {
        MEMORY_INDEX = (MEMORY_INDEX + 1) % MEMORY_MAX_SIZE;
    }

    index

}
#[no_mangle]
pub extern "C" fn mem_alloc(size: usize) -> usize {

    let index = unsafe { MEMORY_INDEX };
    let old_size = mem_size(index);

    let ptr = if old_size > 0 {
        let ptr = mem_addr(index) as *mut u8;
        let mut vec = unsafe { Vec::from_raw_parts(ptr, old_size, old_size) };

        vec.resize(size, 0);

        let ptr = vec.as_ptr();
        ptr
    } else {
        let  vec = vec![0; size];
        let ptr = vec.as_ptr();
        std::mem::forget(vec);
        ptr
    };

    unsafe {
        MEMORY_SIZE[index] = size;

        MEMORY_ADDR[index] = ptr as usize;
    }

    unsafe {
        MEMORY_INDEX = (MEMORY_INDEX + 1) % MEMORY_MAX_SIZE;
    }

    index
}
#[no_mangle]
pub extern "C" fn mem_drop(i: usize) {
    let size = mem_size(i);
    if size == 0 {
        return;
    }

    let ptr = mem_addr(i) as *mut u8;

    let _ = unsafe { Vec::from_raw_parts(ptr, size, size) };

    unsafe {
        MEMORY_SIZE[i] = 0;

        MEMORY_ADDR[i] = 0 as usize;
    };
}
#[no_mangle]
pub extern "C" fn change_string(ptr:*mut u8, size:usize)-> usize{

    let s1 = unsafe{String::from_raw_parts(ptr, size, size)};

    let s2 = format!("hello {}, ptr:{:?}, size:{}", s1, ptr, size);

    let index = mem_store(s2.as_ptr(),s2.as_bytes().len());
    std::mem::forget(s2);
    index
}


#[no_mangle]
pub extern "C" fn dummy() {
    nx_mem::ta_alloc::my_init();
    let ptr = nx_mem::ta_alloc::my_alloc(100) as *const u8;
    println!("ptr, {:?}", ptr);
    let ptr = nx_mem::ta_alloc::my_alloc(100) as *const u8;
    println!("ptr, {:?}", ptr);
    let _ = nx_mem::ta_alloc::my_get_size(ptr);
    nx_mem::ta_alloc::my_free(ptr);
    // let _ = nx_mem::ta_alloc::my_get_size(ptr);
}

#[no_mangle]
pub extern "C" fn init_main_memory_buffer() -> usize {
    if (unsafe { !MY_TA_BUFFER_INIT }) {
        let mut zero_vec = vec![0u8; MY_TA_BUFFER_SIZE];
        let base = zero_vec.as_mut_ptr();
        std::mem::forget(zero_vec);

        nx_mem::ta_alloc::my_init_buffer(
            // unsafe { &raw mut MY_TA_BUFFER } as *mut u8,
            base,
            MY_TA_BUFFER_SIZE,
        );

        unsafe { MY_TA_BUFFER_INIT = true };
    }

    1 as usize
}

#[no_mangle]
pub extern "C" fn hello_num(num: usize) -> usize {
    //  println!("wasi recieve num {}",num )

    num + 10
}

use std::fmt::format;
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
#[no_mangle]
pub static mut __heap_base: u8 = 0;
#[no_mangle]
pub extern "C" fn html_rewrite(
    html_ptr: *const u8,
    html_len: usize,
    proxy_host_ptr: *const u8,
    proxy_host_len: usize,
    target_host_ptr: *const u8,
    target_host_len: usize,
) -> *const u8 {
    let html = unsafe { String::from_raw_parts(html_ptr as *mut u8, html_len, html_len) };

    let proxy_host = unsafe {
        String::from_raw_parts(proxy_host_ptr as *mut u8, proxy_host_len, proxy_host_len)
    };

    let target_host = unsafe {
        String::from_raw_parts(target_host_ptr as *mut u8, target_host_len, target_host_len)
    };

    let html = nx_html::my_html_rewrite(html.as_str(), proxy_host.as_str(), target_host.as_str());

    let resp_html_ptr = nx_mem::ta_alloc::my_alloc(html.len()) as *mut u8;

    // unsafe {
    //     std::ptr::copy(html.as_ptr(), resp_html_ptr as *mut _, html.len());
    // }

    let buf = unsafe { std::slice::from_raw_parts_mut(resp_html_ptr, html.len()) };
    // println!(" buf len : {}", buf.len());
    buf.copy_from_slice(html.as_bytes());
    // std::mem::forget(html);

    resp_html_ptr
}

const MY_TA_BUFFER_SIZE: usize = 1024 * 1024 * 2;
static mut MY_TA_BUFFER: [u8; MY_TA_BUFFER_SIZE] = [0; MY_TA_BUFFER_SIZE];
static mut MY_TA_BUFFER_INIT: bool = false;
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
    </head>
    <body>
        <p>==== Nav ====</p>
        {nav}
        <img src="aaaa"> </img>
    </body>
</html>

    

"#;

    let proxy_host = "aaaa".to_string();
    let target_host = "bbbb".to_string();

    init_main_memory_buffer();

    let html: String = nx_html::my_html_rewrite(html, proxy_host.as_str(), target_host.as_str());
    let d = unsafe { &mut MY_TA_BUFFER[1] };
    *d = 100;

    println!("base      ptr:{:?}", unsafe { &raw mut MY_TA_BUFFER }
        as *mut u8);
    println!("basesize  ptr:{:?}", unsafe { &mut MY_TA_BUFFER_SIZE }
        as *mut usize);
    println!("d         ptr:{:?}", unsafe { d } as *mut u8);

    let resp_html_ptr = nx_mem::ta_alloc::my_alloc(html.len()) as *mut u8;

    println!("resp_html_ptr:{:?}", resp_html_ptr);

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
