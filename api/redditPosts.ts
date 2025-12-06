import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { sub, sort, after } = req.query;

        if (!sub || !sort || Array.isArray(sub) || Array.isArray(sort)) {
            res.status(400).json({ error: "Missing or invalid parameters" });
            return;
        }

        const afterParam = after && !Array.isArray(after) ? `&after=${after}` : "";
        const url = `https://www.reddit.com/r/${sub}/${sort}.json?limit=25${afterParam}`;

        const response = await fetch(url);
        if (!response.ok) {
            res.status(response.status).json({ error: "Failed to fetch Reddit data" });
            return;
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch Reddit data" });
    }
}
