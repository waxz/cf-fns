use std::cell::RefCell;

// Note: static items do not call [`Drop`] on program termination, so this won't be deallocated.
// this is fine, as the OS can deallocate the terminated program faster than we can free memory
// but tools like valgrind might report "memory leaks" as it isn't obvious this is intentional.
use once_cell::unsync::Lazy;
// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

static mut SHARED_BUFFER: [u8; 10240] = [0; 10240];

use lazy_mut::LazyMut;

static VICTOR: LazyMut<Vec<u8>> = LazyMut::new(|| vec![1, 2, 3]);

static MEMORY_REC: LazyMut<HashMap<usize, usize>> = LazyMut::new(|| HashMap::new());
struct Global {
    pointer_list: HashMap<usize, usize>,
}
impl Global {
    fn new() -> Self {
        Self {
            pointer_list: HashMap::new(),
        }
    }
}

// static  GLOBAL: Global = Global::new();

use std::alloc::{Layout, alloc, dealloc};
use std::collections::HashMap;

#[unsafe(no_mangle)]
pub extern "C" fn my_alloc(size: usize) -> *mut u8 {
    let align = std::mem::align_of::<usize>();
    let layout = unsafe { Layout::from_size_align_unchecked(size, align) };
    let ptr = unsafe { alloc(layout) };
    let k = ptr as usize;
    {
        MEMORY_REC.get_mut().insert(k, size);
    }

    ptr
}

#[unsafe(no_mangle)]
pub extern "C" fn my_alloc_register(ptr: *mut u8, size : usize) {
    let k = ptr as usize;
    {
        MEMORY_REC.get_mut().insert(k, size);
    }
}


#[unsafe(no_mangle)]

pub extern "C" fn my_dealloc(ptr: *mut u8) {
    let k = ptr as usize;

    let mut size = 0;
    {
        if let Some(v) = MEMORY_REC.get_mut().get(&k) {
            size = *v;
        }

        if size > 0 {
            my_dealloc_size(ptr, size);
            MEMORY_REC.get_mut().remove(&k);
        }
    }
}

#[unsafe(no_mangle)]

pub extern "C" fn my_dealloc_size(ptr: *mut u8, size: usize) {
    let align = std::mem::align_of::<usize>();
    let layout = unsafe { Layout::from_size_align_unchecked(size, align) };
    unsafe { dealloc(ptr, layout) };
}
