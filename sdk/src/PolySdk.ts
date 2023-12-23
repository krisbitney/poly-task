import { WasmHandler } from "./WasmHandler";
import { ADD_ENDPOINT, BASE_URL, WASM_MODULE_URL } from "./constants";
import { AddResponse, i32 } from "./types";
import axios from "axios";

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
        const shouldRunLocally = this?.options?.runLocallyByDefault ?? runLocally ?? false;
        console.log(`Executing doWork locally: ${shouldRunLocally}`);
        if (shouldRunLocally) {
            if (!this.localModule) {
                this.localModule = await this.createWasmHandler();
            }
            const result = await this.localModule.invoke(n1, n2);
            console.log(`Local result: ${result}`);
            return result;
        }

        const url = `${BASE_URL}/${ADD_ENDPOINT}`;
        console.log(`Executing doWork remotely: ${url}`);
        return await axios.get<AddResponse>(url, {
            params: {
                n1,
                n2
            }
        })
            .then((response) => {
                if (response.data.error) {
                    throw new Error(response.data.error);
                } else if (response.data.result === undefined) {
                    throw new Error("Invalid response");
                }
                console.log(`Server result: ${response.data.result}`);
                return response.data.result;
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