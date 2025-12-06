import type {VercelRequest, VercelResponse} from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const {query} = req.query;

        if (!query || Array.isArray(query)) {
            res.status(400).json({error: "Missing or invalid query parameter"});
            return;
        }

        const url = `https://www.reddit.com/api/search_reddit_names.json?query=${query}&exact=false`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (!response.ok) {
            res.status(response.status).json({error: "Failed to fetch suggestions"});
            return;
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Failed to fetch suggestions"});
    }
}
