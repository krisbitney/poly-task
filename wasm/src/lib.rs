#[no_mangle]
pub extern "C" fn wasmExport(n1: i32, n2: i32) -> i32 {
    n1 + n2
}
