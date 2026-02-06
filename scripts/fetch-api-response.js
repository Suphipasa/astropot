#!/usr/bin/env node
/**
 * One-off script to log Vedic Astro API response shape.
 * Run: node scripts/fetch-api-response.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(envPath, 'utf8');
const line = env.split('\n').find((l) => l.startsWith('EXPO_PUBLIC_VEDIC_API_KEY='));
const apiKey = line ? line.split('=')[1].trim() : '';

const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();
const date = `${day}/${month}/${year}`;

const url = new URL('https://api.vedicastroapi.com/v3-json/horoscope/sun-sign-daily');
url.searchParams.set('zodiac', '8');
url.searchParams.set('date', date);
url.searchParams.set('lang', 'en');
url.searchParams.set('api_key', apiKey);

https
  .get(url.toString(), (res) => {
    let body = '';
    res.on('data', (ch) => (body += ch));
    res.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.log(body);
      }
    });
  })
  .on('error', (e) => console.error(e));
