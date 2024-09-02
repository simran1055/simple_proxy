const functions = require('firebase-functions');
const express = require('express');
const axios = require('axios');
const fs = require("fs");

const app = express();

// Middleware to parse JSON bodies (for POST, PUT, etc.)
app.use(express.json());

app.all('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
        // Create an Axios request configuration based on the incoming request
        const config = {
            method: req.method,
            url: targetUrl,
            headers: {
                host: undefined, // Remove the host header to avoid conflicts
            },
            responseType: 'stream', // Handle streaming responses
        };

        // Perform the request using Axios
        const response = await axios(config);

        // Set response headers and status code from the proxied response
        // Remove problematic headers
        const headers = { ...response.headers };
        delete headers['content-length']; // Avoid issues with content-length header
        delete headers['transfer-encoding']; // Avoid issues with transfer-encoding header

        res.set(headers);
        res.status(response.status);

        // Pipe the response data directly to the client
        response.data.pipe(res);
    } catch (error) {
        console.error('Error fetching the URL:', error.message);
        console.error('Error details:', error); // Log full error details for debugging

        // Handle different types of errors
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

https.createServer(options, app)
    .listen(3000, function (req, res) {
        console.log("Server started at port 3000");
    });

// exports.api = functions.https.onRequest(app);

// app.listen(3000, ()=>{})