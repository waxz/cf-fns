pub(crate) mod from_c {
    unsafe extern "C" {

        pub fn ta_init(
            base: *const u8,
            limit: *const u8,
            heap_blocks: usize,
            split_thresh: usize,
            alignment: usize,
        ) -> bool;

        pub fn ta_alloc(num: usize) -> *const u8;
        pub fn ta_alloc11(num: usize) -> *const u8;

        pub fn ta_calloc(num: usize, size: usize) -> *const u8;
        pub fn ta_getsize(ptr: *const u8) -> usize;
        pub fn ta_free(ptr: *const u8) -> bool;
        pub fn ta_num_free() -> usize;
        pub fn ta_num_used() -> usize;
        pub fn ta_num_fresh() -> usize;
        pub fn ta_check() -> bool;
    }
}

pub(crate) mod from_rust {



}


use hashbrown::HashMap;
use lazy_mut::LazyMut;
use std::{ops::Deref, sync::Mutex};
static SHARED_BUFFER_SIZE: usize = 102400;


// #[allow(static_mut_refs)]
// static mut SHARED_BUFFER: [u8; SHARED_BUFFER_SIZE] = [0; SHARED_BUFFER_SIZE];
// static SHARED_BUFFER: Mutex< [u8; SHARED_BUFFER_SIZE]> = Mutex::new([0; SHARED_BUFFER_SIZE]);
static SHARED_BUFFER: LazyMut<[u8; SHARED_BUFFER_SIZE]> = LazyMut::new(|| [0; SHARED_BUFFER_SIZE]);
static SHARED_BUFFER_ALLIGN:usize = 8;

// use alloc_cat::{ALLOCATOR, AllocCat};

// #[global_allocator]
// pub static GLOBAL_ALLOCATOR: &AllocCat = &ALLOCATOR;

// static SHARED_BUFFER_RECORD: Mutex<HashMap<usize, usize> > = Mutex::new(HashMap::new() );

static MEMORY_REC: LazyMut<HashMap<usize, usize>> = LazyMut::new(|| HashMap::new());

// static mut SHARED_BUFFER_RECORD: std::sync::LazyLock<  Mutex<HashMap<usize, usize>>> = std::sync::LazyLock::new(|| {
//     Mutex::new(HashMap::new())
// });

static mut TA_ALLOC_INIT: u32 = 0;
fn align_up(x: usize, align: usize) -> usize {
    (x + align - 1) & !(align - 1)
}
#[unsafe(no_mangle)]
pub extern "C" fn my_init() -> u32 {
    unsafe {
        if TA_ALLOC_INIT == 0 {
            let mut v: Vec<u8> = Vec::new();

            // MEMORY_REC.get_mut().insert(1 , 0);

            // let base = SHARED_BUFFER.as_ptr() as * const u8;
            SHARED_BUFFER.get_mut().fill(0);

            let base = SHARED_BUFFER.get_mut().as_mut_ptr();
            let base_aligend = align_up(base as usize, SHARED_BUFFER_ALLIGN);
            let offset = base_aligend - base as usize;

            let ok: bool = from_c::ta_init(base.add(offset), base.add(SHARED_BUFFER_SIZE-1-offset), 512, 16, SHARED_BUFFER_ALLIGN);

            if (ok) {
                SHARED_BUFFER.get_mut()[SHARED_BUFFER_SIZE - 2] = 10;
            }else{
                SHARED_BUFFER.get_mut()[SHARED_BUFFER_SIZE - 2] = 50;

            }
        }

        TA_ALLOC_INIT += 1;

        SHARED_BUFFER.get_mut()[SHARED_BUFFER_SIZE - 2] as u32
    }
}



#[unsafe(no_mangle)]
pub extern "C" fn my_alloc(size: usize) -> *const u8 {
    let size = align_up(size, SHARED_BUFFER_ALLIGN);

    let ptr = unsafe { from_c::ta_alloc(size) };
    if(!ptr.is_null()){
        SHARED_BUFFER.get_mut()[SHARED_BUFFER_SIZE - 2] +=1;
    }else{
        SHARED_BUFFER.get_mut()[SHARED_BUFFER_SIZE - 2] = 99;

    }
    // MEMORY_REC.get_mut().insert(ptr , size);
    ptr 
}

#[unsafe(no_mangle)]
pub extern "C" fn my_free(ptr: *const u8) -> bool {
    unsafe { from_c::ta_free(ptr as *mut u8) }
}

#[unsafe(no_mangle)]
pub extern "C" fn my_get_size(ptr: *const u8) -> usize {
    unsafe { from_c::ta_getsize(ptr as *mut u8) }
}
