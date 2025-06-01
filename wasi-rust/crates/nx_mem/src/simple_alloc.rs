
const MEMORY_MAX_SIZE: usize = 200;
static mut MEMORY_INDEX: usize = 0;
static mut MEMORY_ADDR: [usize; MEMORY_MAX_SIZE] = [0; MEMORY_MAX_SIZE];
static mut MEMORY_SIZE: [usize; MEMORY_MAX_SIZE] = [0; MEMORY_MAX_SIZE];

#[unsafe(no_mangle)]
pub extern "C" fn mem_addr(i: usize) -> usize {
    unsafe { MEMORY_ADDR[i] }
}

#[unsafe(no_mangle)]
pub extern "C" fn mem_size(i: usize) -> usize {
    unsafe { MEMORY_SIZE[i] }
}

#[unsafe(no_mangle)]
pub extern "C" fn mem_store(ptr:*const u8, size:usize)->usize{
    let index = unsafe { MEMORY_INDEX }.max(1);

    let old_size = mem_size(index);

    if old_size > 0{
        mem_drop(index);
    }
        unsafe {
        MEMORY_SIZE[index] = size;

        MEMORY_ADDR[index] = ptr as usize;
    }

    unsafe {
        MEMORY_INDEX = (index + 1) % MEMORY_MAX_SIZE;
    }

    index

}
#[unsafe(no_mangle)]
pub extern "C" fn mem_alloc(size: usize) -> usize {
    let index = unsafe { MEMORY_INDEX }.max(1);

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
        MEMORY_INDEX = (index + 1) % MEMORY_MAX_SIZE;
    }

    index
}
#[unsafe(no_mangle)]
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