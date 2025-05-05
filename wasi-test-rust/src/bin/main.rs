use std::env;
use std::ffi::CString;
use std::fs;
use std::io::{Read, Write};

#[no_mangle]
fn main() {
    println!("hello wasi");
    let args: Vec<String> = env::args().collect();
    println!("argc = {} , argv = {:?}", args.len(), &args);

    let output_str = "/tmp/stdout.txt";

    let contents = "hello";
    let mut output_file = match fs::File::create(output_str) {
        Ok(file) => file,
        Err(_) => {
            println!("create err");
            return;
        } // Return error code -3 for file creation error
    };

    if let Err(_) = output_file.write_all(contents.as_bytes()) {
        println!("output_file err");

        return; // Return error code -4 for write error
    }

    let mut input_file = match fs::File::open(output_str) {
        Ok(file) => file,
        Err(_) => {
            println!("open err");
            return;
        } // Return error code -1 for file open error
    };
    let mut contents = Vec::new();
    if let Err(_) = input_file.read_to_end(&mut contents) {
        println!("read_to_end err");
        return; // Return error code -2 for read error
    }
    println!("input_file contents= {:?}", &contents);
}

#[no_mangle]
pub extern "C" fn process(input_fname: *const i8, output_fname: *const i8) -> i32 {
    // Convert C-style strings (char pointers) into Rust strings
    let input_str = unsafe {
        std::ffi::CStr::from_ptr(input_fname as *const i8)
            .to_str()
            .unwrap_or_default()
    };
    let output_str = unsafe {
        std::ffi::CStr::from_ptr(output_fname as *const i8)
            .to_str()
            .unwrap_or_default()
    };

    let mut input_file = match fs::File::open(input_str) {
        Ok(file) => file,
        Err(_) => return -1, // Return error code -1 for file open error
    };

    let mut contents = Vec::new();
    if let Err(_) = input_file.read_to_end(&mut contents) {
        return -2; // Return error code -2 for read error
    }

    let mut output_file = match fs::File::create(output_str) {
        Ok(file) => file,
        Err(_) => return -3, // Return error code -3 for file creation error
    };

    if let Err(_) = output_file.write_all(&contents) {
        return -4; // Return error code -4 for write error
    }

    0 // Return 0 for success
}
/*
    let args: Vec<String> = env::args().collect();
    let program = args[0].clone();

    if args.len() < 3 {
        eprintln!("usage: {} <from> <to>", program);
        return;
    }

    let input_fname = CString::new(args[1].clone()).unwrap();
    let output_fname = CString::new(args[2].clone()).unwrap();

        eprintln!("{}: <from>:{:?} <to>:{:?}", program,&input_fname,&output_fname);

    let result =   {
       process(input_fname.as_ptr(), output_fname.as_ptr())
    };

    if result != 0 {
        eprintln!("Error: {}", result);
    }
*/
//
