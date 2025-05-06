use std::env;
use std::ffi::CString;
use std::fs;
use std::io::{Read, Write}; 
#[no_mangle]
use std::error::Error;
use std::io::{self, BufRead};
// use ureq::tls::TlsConfig;
// use ureq::{config::Config, Agent, Proxy};

// Use this example with something like mitmproxy
// $ mitmproxy --listen-port 8080
use burn::tensor;
// use burn::backend::NdArray;

// Type alias for the backend to use.
// type Backend = NdArray;


fn run_burn(){

}

fn list_path(path:&str){
    println!("list_path: {}", path);
    let paths = fs::read_dir(path).unwrap();

    for path in paths {
        println!("Name: {}", path.unwrap().path().display())
    }
}

fn read(path: &str) -> Result<(), Box<dyn Error>>{
    println!("read: {}", path);

    let mut input_file = match fs::File::open(path) {
        Ok(file) => file,
        Err(e) => {
            println!("open {path} err : {e}");
            return  Ok(());
        } // Return error code -1 for file open error
    };

    let mut contents = Vec::new();
    if let Err(e) = input_file.read_to_end(&mut contents) {
        println!("read_to_end {path} err: {e}");
        return Ok(()); // Return error code -2 for read error
    }
    let contents = String::from_utf8(contents);

    println!("{path} contents= {:?}", &contents);
      Ok(())

}
fn write(path: &str, contents :& str) -> Result<(), Box<dyn Error>>{
    println!("write: {path}, {contents}");

    let mut input_file = match fs::File::create(path) {
        Ok(file) => file,
        Err(e) => {
            println!("open {path} err : {e}");
            return  Ok(());
        } // Return error code -1 for file open error
    };

 
    // let contents = String::from_utf8(contents);
    if let Err(e) = input_file.write_all(contents.as_bytes()) {
        println!("write_all {path} err: {e}");
        return Ok(()); // Return error code -2 for read error
    }
      Ok(())

}

fn main() -> Result<(), Box<dyn Error>>{

    {
//         let url = "http://example.com";

//         let body: String = ureq::get(url)
//     .header("Example-Header", "header value")
//     .call()?
//     .body_mut()
//     .read_to_string()?;
// println!("body: {:?}", body);

    }

    //env

    if let  Ok(pwd) = std::env::current_dir(){
        println!("hello wasi pwd :{:?} ",pwd);
    }

    //stdin
    println!("hello stdin");

    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        println!("{}", line.unwrap());
    }

    // env
    let HOME = env!("HOME", "$HOME is not set");
    println!("HOME is set to {}", HOME);
    let env_name = "PROJECT_NAME";
    match env::var(env_name) {
        Ok(v) => println!("{}: {}",env_name, v),
        Err(e) => println!("${} is not set ({})", env_name, e)
    }

    println!("hello wasi");
    let args: Vec<String> = env::args().collect();
    println!("argc = {} , argv = {:?}", args.len(), &args);

    
    if(args.len() > 1){
        if(args[0] == "ls"){
            list_path(args[1].as_str());
        }
        if(args[0] == "read"){
            read(args[1].as_str());
        }
        if(args[0] == "write"){
            write(args[1].as_str(), args[2].as_str());
            read(args[1].as_str());
        }
    }


    let output_str = "/tmp/stdout.txt";

    let contents = "hello";
    let mut output_file = match fs::File::create(output_str) {
        Ok(file) => file,
        Err(_) => {
            println!("create err");
            return Ok(());
        } // Return error code -3 for file creation error
    };

    if let Err(_) = output_file.write_all(contents.as_bytes()) {
        println!("output_file err");

        return  Ok(()); // Return error code -4 for write error
    }

    let mut input_file = match fs::File::open(output_str) {
        Ok(file) => file,
        Err(_) => {
            println!("open err");
            return  Ok(());
        } // Return error code -1 for file open error
    };
    let mut contents = Vec::new();
    if let Err(_) = input_file.read_to_end(&mut contents) {
        println!("read_to_end err");
        return Ok(()); // Return error code -2 for read error
    }
    let contents = String::from_utf8(contents);

    println!("input_file contents= {:?}", &contents);
    return Ok(())
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
