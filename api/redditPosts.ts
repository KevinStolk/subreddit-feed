import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { sub, sort, after } = req.query;

        if (!sub || Array.isArray(sub) || Array.isArray(sort)) {
            return res.status(400).json({ error: "Missing or invalid parameters" });
        }

        const afterParam = after && !Array.isArray(after) ? `&after=${after}` : "";
        const url = `https://www.reddit.com/r/${sub}/${sort}.json?limit=25${afterParam}`;

        const response = await fetch(url, {});

        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch Reddit data" });
        }

        const data = await response.json();

        return res.status(200).json(data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error fetching Reddit data" });
    }
}
