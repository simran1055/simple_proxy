import functions from 'firebase-functions';
import express from 'express';
import cloudscraper from 'cloudscraper';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // Define the headers as per your input
        const headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'max-age=0',
            'dnt': '1',
            'if-modified-since': 'Wed, 21 Aug 2024 14:02:28 GMT',
            'priority': 'u=0, i',
            'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Referer': 'https://i.ibb.co',
            'Origin': 'https://i.ibb.co',
            'If-None-Match': '"/R102j7ByREEJjbwyRAYuOpXPCA="',
        };

        // Make the request using cloudscraper with all the headers
        const response = await cloudscraper.get({
            uri: targetUrl,
            headers: headers,
            resolveWithFullResponse: true, // Ensure the full response object is returned
            encoding: null, // Keep the response as buffer if binary data is returned
        });

        // Set the response headers and status
        res.set(response.headers);
        res.status(response.statusCode);

        // Send the response body
        res.send(response.body);
    } catch (error) {
        console.error('Request failed:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

app.listen(3000)