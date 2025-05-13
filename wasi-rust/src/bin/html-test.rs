use nx_html::test_html;
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


// use alloc_cat::{ALLOCATOR, AllocCat};

// #[global_allocator]
// pub static GLOBAL_ALLOCATOR: &AllocCat = &ALLOCATOR;


#[no_mangle]
pub extern "C" fn dummy()  {
    nx_mem::ta_alloc::my_init();
    let ptr = nx_mem::ta_alloc::my_alloc(100) as *const u8;
    println!("ptr, {:?}", ptr);
    let ptr = nx_mem::ta_alloc::my_alloc(100) as *const u8;
    println!("ptr, {:?}", ptr);
    let _ =  nx_mem::ta_alloc::my_get_size(ptr);
    nx_mem::ta_alloc::my_free(ptr);
    let _ = nx_mem::ta_alloc::my_get_size(ptr);

}

#[no_mangle]
pub extern "C" fn hello_num(num: usize) -> usize {
    //  println!("wasi recieve num {}",num )

    num + 10
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
    println!("html_rewrit, proxy_domain:{proxy_domain}, proxy_path:{proxy_path}, target_domain:{target_domain}, html:{html}")
}

fn main() -> std::io::Result<()> { 


dummy();




    return Ok(());
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
