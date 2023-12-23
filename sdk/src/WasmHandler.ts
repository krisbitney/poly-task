import { AsyncWasmInstance } from "@polywrap/asyncify-js";
import { i32 } from "./types";

interface WasmExports extends WebAssembly.Exports {
    wasmExport: (n1: i32, n2: i32) => i32;
}

export class WasmHandler {

    wasmExports: readonly string[] = ["wasmExport"];

    private memory = new WebAssembly.Memory({ initial: 16 });
    private instance: AsyncWasmInstance | undefined;
    private exports: WasmExports | undefined;

    constructor(private wasmModule: Uint8Array) {}

    public async invoke(n1: i32, n2: i32): Promise<i32> {
        if (!this.exports) {
            await this.createInstance();
        }
        return this.exports!.wasmExport(n1, n2);
    }

    private async createInstance(): Promise<void> {
        this.instance = await AsyncWasmInstance.createInstance({
            module: this.wasmModule,
            imports: {
                env: {
                    memory: this.memory,
                },
            },
            requiredExports: this.wasmExports,
        });
        this.exports = this.instance.exports as WasmExports;
    }
}
