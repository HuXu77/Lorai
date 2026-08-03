#!/usr/bin/env ts-node
// @ts-nocheck

const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://lorcanajson.org/files/current/en/allCards.json';
const destPath = path.resolve(__dirname, '../../allCards.json');

console.log(`Downloading allCards.json from ${url}...`);

const file = fs.createWriteStream(destPath);

https.get(url, (response) => {
    if (response.statusCode !== 200) {
        console.error(`Failed to get '${url}' (${response.statusCode})`);
        response.resume();
        return;
    }

    response.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded and saved to ${destPath}`);
    });
}).on('error', (err) => {
    fs.unlink(destPath, () => {});
    console.error(`Error downloading file: ${err.message}`);
});
