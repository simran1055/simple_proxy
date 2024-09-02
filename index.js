const functions = require('firebase-functions');
const express = require('express');
const axios = require('axios');
const https = require("https");
const app = express();
const fs = require("fs");
// Middleware to parse JSON bodies (for POST, PUT, etc.)
app.use(express.json());

app.all('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        let headers = {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=0, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"
        };

        // Use axios to fetch the image
        const response = await axios({
            url: targetUrl,
            method: 'GET',
            responseType: 'stream',
            headers: headers
        });

        // Pipe the image data directly to the response
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching the URL:', error.message);
        console.error('Error details:', error); // Log full error details for debugging

        if (error.response) {
            res.status(error.response.status).json({
                error: 'Error fetching the URL',
                status: error.response.status,
                data: error.response.data,
            });
        } else if (error.request) {
            res.status(500).json({
                error: 'No response received from the target URL',
            });
        } else {
            res.status(500).json({
                error: 'Error setting up the request',
            });
        }
    }
});

const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

// For Firebase Functions
// exports.api = functions.https.onRequest(app);

// For local testing
https.createServer(options, app)
    .listen(3000, function (req, res) {
       console.log("Server started at port 3000");
   });
