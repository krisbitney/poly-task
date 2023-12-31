import express, { Request, Response } from "express";
import { PolySdk, i32 } from "poly-sdk";

const app = express();
const port = 3000;

const sdk = new PolySdk({ runLocallyByDefault: true });

app.get("/add", async (req: Request, res: Response) => {
    console.log("Received request");
    let result: i32;
    try {
        const query = req.query as { n1: string; n2: string };
        const n1: i32 = parseInt(query.n1);
        const n2: i32 = parseInt(query.n2);
        console.log(`Remotely adding ${n1} + ${n2}`);
        result = await sdk.doWork(n1, n2);
    } catch (e) {
        res.send({ error: e.message });
        return;
    }
    res.send({ result });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});