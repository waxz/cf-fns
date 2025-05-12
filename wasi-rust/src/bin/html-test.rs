use nx_html::test_html;
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

static SHARED_BUFFER_SIZE: usize = 10240;
static mut SHARED_BUFFER: [u8; SHARED_BUFFER_SIZE] = [0; SHARED_BUFFER_SIZE];

static INPUT_SHARED_BUFFER_SIZE: usize = 10240;
static mut INPUT_SHARED_BUFFER: [u8; INPUT_SHARED_BUFFER_SIZE] = [0; INPUT_SHARED_BUFFER_SIZE];

static mut SHARED_BUFFER_STR_LEN: usize = 100;

// static SHARED_BUFFER_HEADER_LEN :usize = 100;
// static SHARED_BUFFER_CAPACITY :usize = SHARED_BUFFER_SIZE - SHARED_BUFFER_HEADER_LEN;

static mut TA_ALLOC_INIT: bool = false;

extern "C" {

    fn ta_init(
        base: *const u8,
        limit: *const u8,
        heap_blocks: usize,
        split_thresh: usize,
        alignment: usize,
    ) -> bool;

    fn ta_alloc(num: usize) -> *const u8;

    fn ta_calloc(num: usize, size: usize) -> *const u8;

    fn ta_free(ptr: *const u8) -> bool;
    fn ta_num_free() -> usize;
    fn ta_num_used() -> usize;
    fn ta_num_fresh() -> usize;
    fn ta_check() -> bool;
}

#[no_mangle]
pub extern "C" fn init_ta_alloc()->bool {
    unsafe {
        if(!TA_ALLOC_INIT){


        let ok : bool = ta_init(
            SHARED_BUFFER.as_ptr(),
            SHARED_BUFFER.as_mut_ptr().add(SHARED_BUFFER_SIZE),
            256,
            16,
            8,
        );
        
        TA_ALLOC_INIT = ok;


        }

       TA_ALLOC_INIT
    }

    
}

#[no_mangle]
pub extern "C" fn hello_num(num: usize) -> usize {
    //  println!("wasi recieve num {}",num )

    num + 10
}

#[no_mangle]
pub extern "C" fn hello_str(ptr: *mut u8, size: usize) {
    let data = unsafe { String::from_raw_parts(ptr, size, size) };

    let mut s = format!("hello {data} from wasi");

    unsafe {
        SHARED_BUFFER_STR_LEN = s.len();

        // Copy the string into the static buffer
        let string_bytes = s.into_bytes();
        SHARED_BUFFER[..string_bytes.len()].copy_from_slice(string_bytes.as_slice());
    }
    // std::mem::forget(s);
    // ptr
}

#[no_mangle]
pub extern "C" fn get_buffer_ptr() -> *const u8 {
    unsafe { SHARED_BUFFER.as_mut_ptr() }
}

#[no_mangle]
pub extern "C" fn get_input_buffer_ptr() -> *const u8 {
    unsafe { INPUT_SHARED_BUFFER.as_mut_ptr() }
}

#[no_mangle]
pub extern "C" fn get_buffer_len() -> usize {
    // let size: usize = unsafe{*( SHARED_BUFFER.as_ptr() as * const usize)};
    unsafe { SHARED_BUFFER_STR_LEN }
}

#[no_mangle]
pub extern "C" fn drop_str(ptr: *mut u8) {
    nx_mem::my_dealloc(ptr);
}

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

#[no_mangle]
pub extern "C" fn html_rewrite(
    html: &str,
    proxy_domain: &str,
    proxy_path: &str,
    target_domain: &str,
) {
    println!("html_rewrit, proxy_domain:{proxy_domain}, proxy_path:{proxy_path}, target_domain:{target_domain}")
}

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
    </body>
</html>

    

"#;
    test_html(html);

    println!("run html-test.rs");
    Ok(())
}
