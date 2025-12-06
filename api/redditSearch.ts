import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { query } = req.query;

        if (!query || typeof query !== "string") {
            res.status(400).json({ error: "Missing query parameter" });
            return
        }

        const url = `https://www.reddit.com/api/search_reddit_names.json?query=${query}&exact=false`;

        const response = await fetch(url, {
        });

        if (!response.ok) {
            res.status(response.status).json({ error: "Failed to fetch Reddit data" });
            return;
        }

        const data = await response.json();

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
}
