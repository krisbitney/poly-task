import {PolySdk} from "../build";

jest.setTimeout(360000);

describe("PolySDK", () => {

    const sdk = new PolySdk();

    it("should run locally", async () => {
        const result = await sdk.doWork(1, 2, true);
        expect(result).toBe(3);
    });

    it("should run in server", async () => {
        const result = await sdk.doWork(1, 2, false);
        expect(result).toBe(3);
    });
});