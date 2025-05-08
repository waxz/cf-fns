


use std::cell::RefCell;

use log::info;

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
#[no_mangle]
pub   extern "C"   fn my_alloc(size: usize) -> *mut u8 {
    let align = std::mem::align_of::<usize>();
    let layout = unsafe {Layout::from_size_align_unchecked(size, align)};
    let ptr = unsafe {alloc(layout)};
    let k = ptr as usize;
    unsafe {
        MEMORY_REC.borrow_mut().insert(k, size);
    } 
    info!("my_alloc ptr {:?}, {}!", ptr, size);

    ptr
}
#[no_mangle]
pub   extern "C"  fn my_dealloc(ptr: *mut u8) {
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

#[no_mangle]
pub   extern "C" fn my_dealloc_size(ptr: *mut u8, size: usize) {
    let align = std::mem::align_of::<usize>();
    let layout = unsafe{Layout::from_size_align_unchecked(size, align)} ;
    unsafe {dealloc(ptr, layout)};
}