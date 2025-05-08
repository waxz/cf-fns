// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


use dom_query::Document;

static mut SHARED_BUFFER: [u8; 1024000] = [0; 1024000];


mod utils;


fn f(){
    let p = utils::my_alloc(100) ;

}


