

// share memory
// use std::ptr;
// use std::slice;
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;


// pub mod  ta_alloc;

pub mod simple_alloc;

 