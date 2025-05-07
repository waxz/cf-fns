use std::env;
use std::path::PathBuf;
use std::process::Command;
use std::{fs, io};

fn main() -> io::Result<()> {
    println!("run build.rs");
    println!("cargo:rerun-if-changed=src/"); // Trigger rebuild on source changes
    println!("cargo:rerun-if-changed=build.rs");
    std::env::set_var("REBUILD", format!("{:?}", std::time::Instant::now()));
    println!("cargo:rerun-if-env-changed=REBUILD");

    let target = env::var("TARGET").unwrap();
    println!("target:{target}");

    if target.contains("wasm32") {
        let mut target_dir: std::path::PathBuf =
            ::std::env::var_os("CARGO_MANIFEST_DIR").unwrap().into();
        target_dir.push("target");
        target_dir.push(&target);
        target_dir.push(::std::env::var_os("PROFILE").unwrap());

        let target_dir = &*target_dir; // Done mutating
        println!("target_dir:{:?}", target_dir);

        println!("read_dir:{:?}", target_dir);

        let files = fs::read_dir(target_dir).unwrap();
        // files
        //     .filter_map(Result::ok)
        //     .filter_map(|d| d.path().to_str().and_then(|f| if f.ends_with(".wasm") { Some(d) } else { None }))
        //     .for_each(|f| println!("{:?}", f));
        let wasm_files: Vec<_> = files
            .filter_map(Result::ok)
            .filter(|d| {
                if let Some(e) = d.path().extension() {
                    e == "wasm"
                } else {
                    false
                }
            })
            .collect();
        // .for_each(|f| println!("{:?}", f));

        let mut async_output_dir: std::path::PathBuf = target_dir.to_path_buf(); // Done mutating
        async_output_dir.push("async");
        fs::create_dir(&async_output_dir);
        let async_output_dir = &*async_output_dir; // Done mutating

        for wasm_input_path in wasm_files {
            let wasm_output_path = async_output_dir.join(wasm_input_path.file_name());

            println!(
                "cargo:warning=Running wasm-opt --asyncify on {:?}",
                wasm_input_path
            );

            let wasm_opt_command = if let Ok(wasm_bindgen_cli_path) = env::var("WASM_BINDGEN_CLI") {
                PathBuf::from(wasm_bindgen_cli_path).join("wasm-opt")
            } else {
                PathBuf::from("wasm-opt") // Assume wasm-opt is in PATH
            };

            let output = Command::new(wasm_opt_command)
                .arg("--asyncify")
                .arg(wasm_input_path.path())
                .arg("-o")
                .arg(&wasm_output_path)
                .output();

            match output {
                Ok(o) => {
                    if !o.status.success() {
                        eprintln!("cargo:error=wasm-opt failed: {:?}", o);
                    } else {
                        println!(
                        "cargo:warning=wasm-opt --asyncify completed successfully. Output in {:?}",
                        &wasm_output_path
                    );

                        // Optionally, tell Cargo to use the asyncified WASM as the output artifact
                        println!(
                            "cargo:rustc-env=WASM_ASYNCIFIED_PATH={:?}",
                            &wasm_output_path
                        );
                    }
                }
                Err(e) => {
                    eprintln!("cargo:error=Failed to run wasm-opt: {:?}", e);
                }
            }
        }
    }
    Ok(())
}
