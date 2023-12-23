FROM rust:1.70-alpine as base

COPY ./ ./wasm

WORKDIR /wasm

# Install the wasm32 rust build target
RUN rustup target add wasm32-unknown-unknown

# Install curl
RUN apk add curl pkgconfig openssl-dev bash

# Install clang
RUN apk add clang llvm build-base

# Install wasm-opt
RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_101/binaryen-version_101-x86_64-linux.tar.gz | tar -xz \
    && chmod +x binaryen-version_101/bin/wasm-opt \
    && cp binaryen-version_101/bin/wasm-opt /usr/local/bin/ \
    && rm -rf binary-version_101

# Install the toml-cli
RUN cargo install toml-cli

# Install wasm-snip
RUN cargo install wasm-snip

# Install wasm-bindgen
RUN cargo install wasm-bindgen-cli

# Install wasm-tools
RUN cargo install wasm-tools

# Install cargo-build-deps
RUN cargo install cargo-build-deps

# Ensure the Wasm module is configured to use imported memory
ENV RUSTFLAGS="-C link-arg=-z -C link-arg=stack-size=65536 -C link-arg=--import-memory"

# Build the module
RUN cargo build --target wasm32-unknown-unknown --release

# Enable the "WASM_INTERFACE_TYPES" feature, which will remove the __wbindgen_throw import.
# See: https://github.com/rustwasm/wasm-bindgen/blob/7f4663b70bd492278bf0e7bba4eeddb3d840c868/crates/cli-support/src/lib.rs#L397-L403
ENV WASM_INTERFACE_TYPES=1

# Run wasm-bindgen over the module, replacing all placeholder __wbindgen_... imports
RUN wasm-bindgen ./target/wasm32-unknown-unknown/release/poly_wasm.wasm --out-dir . --out-name bg_module.wasm

# Run wasm-tools strip to remove the wasm-interface-types custom section
RUN wasm-tools strip ./bg_module.wasm -d wasm-interface-types -o ./strip_module.wasm
RUN rm -rf ./bg_module.wasm

# Run wasm-snip to trip down the size of the binary, removing any dead code
RUN wasm-snip ./strip_module.wasm -o ./snipped_module.wasm
RUN rm -rf ./strip_module.wasm

# Use wasm-opt to perform the "asyncify" post-processing step over all modules
ENV ASYNCIFY_STACK_SIZE=24576
RUN wasm-opt --asyncify -Os ./snipped_module.wasm -o ./poly.wasm
RUN rm -rf ./snipped_module.wasm