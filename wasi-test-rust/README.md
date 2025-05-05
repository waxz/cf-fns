# wasi

# tutorial
https://github.com/bytecodealliance/wasmtime/blob/main/docs/WASI-tutorial.md
https://docs.wasmtime.dev/cli-options.html#run
https://github.com/bytecodealliance/wasmtime/issues/10291

```bash
rustc --print=target-list
rustc --print=target-list | grep wasi
rustup target add wasm32-unknown-unknown
rustup target add wasm32-wasip1
rustup target add wasm32-wasip2
rustup target add wasm32-wasip1-threads
curl https://wasmtime.dev/install.sh -sSf | bash

cargo install wasm-tools
cargo install wasm-bindgen-cli
sudo apt-fast install wabt
```

# simple rustc
```

rustc +stable --target=wasm32-wasip1  -O main.rs -o hello.wasm
wasmtime hello.wasm
```
# cargo project
### wasm32-wasip1

```bash

TARGET=wasm32-wasip1
cargo build --release --target $TARGET
# cargo component build --release --target $TARGET

# mount dir for sanbox
# wasmtime run --dir=. --dir=/tmp target/$TARGET/release/wasi-test.wasm test.txt /tmp/somewhere.txt
wasmtime run --dir=. --dir=.::/tmp target/$TARGET/release/wasi-test.wasm test.txt /tmp/somewhere.txt

# wasm-tools component wit ./target/$TARGET/release/math.wasm 

wasmtime --invoke multiply ./target/$TARGET/release/math.wasm 3 3 4


```
### wasm32-wasip1-threads
```bash
TARGET=wasm32-wasip1-threads
RUSTFLAGS="-C target-feature=+atomics,+bulk-memory,+mutable-globals" \
cargo build --release --target $TARGET


wasmtime run --wasi threads=yes --dir=. --dir=.::/tmp target/$TARGET/release/wasi-test.wasm test.txt /tmp/somewhere.txt
wasmtime --wasi threads=yes --invoke multiply ./target/$TARGET/release/math.wasm 3 3 4

```

### tools
```bash
wasm-tools dump target/$TARGET/release/wasi-test.wasm | grep "import"
wasm2wat target/$TARGET/release/wasi-test.wasm  | grep memory
```
 