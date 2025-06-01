cargo install cargo-bash
yarn global add wasm-pack
yarn global add wasm-opt

rustup target add wasm32-unknown-unknown
rustup target add wasm32-wasip1
rustup target add wasm32-wasip2
rustup target add wasm32-wasip1-threads
 