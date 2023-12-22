import { WasmHandler } from "./WasmHandler";
import { ADD_ENDPOINT, BASE_URL, WASM_MODULE_URL } from "./constants";
import {AddResponse, i32} from "./types";

export interface PolySdkOptions {
    runLocallyByDefault?: boolean;
}

export class PolySdk {

    private localModule: WasmHandler | undefined;

    constructor(public options?: PolySdkOptions) {}

    async doWork(
        n1: i32,
        n2:i32,
        runLocally?: boolean
    ): Promise<i32> {
        if (!this.is32BitInt(n1) || !this.is32BitInt(n2)) {
            throw new Error("Invalid input");
        }
        const shouldRunLocally = this?.options?.runLocallyByDefault ?? false;
        console.log(`Executing doWork locally: ${shouldRunLocally}`);
        if (shouldRunLocally) {
            if (!this.localModule) {
                this.localModule = await this.createWasmHandler();
            }
            const result = await this.localModule.invoke(n1, n2);
            console.log(`Local result: ${result}`);
            return result;
        }
        return await fetch(`${BASE_URL}/${ADD_ENDPOINT}?n1=${n1}&n2=${n2}`)
            .then((response) => response.json() as Promise<AddResponse>)
            .then((addResponse) => {
                if (addResponse.error) {
                    throw new Error(addResponse.error);
                } else if (addResponse.result === undefined) {
                    throw new Error("Invalid response");
                }
                console.log(`Server result: ${addResponse.result}`);
                return addResponse.result;
            })
            .catch((error) => {
                // TODO: Handle error
                throw error;
            });
    }

    private async createWasmHandler(): Promise<WasmHandler> {
        const wasmModule = await fetch(WASM_MODULE_URL)
            .then((response) => response.arrayBuffer())
            .catch((error) => {
                // TODO: Handle error
                throw error;
            });
        return new WasmHandler(new Uint8Array(wasmModule));
    }

    private is32BitInt(value: number): boolean {
        return (value & 0x7FFFFFFF) === value;
    }
}