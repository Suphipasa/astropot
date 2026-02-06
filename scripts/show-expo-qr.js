#!/usr/bin/env node
/**
 * Prints Expo Go URL and saves a QR code image for scanning.
 * Run: node scripts/show-expo-qr.js
 * Requires: npm install qrcode (optional - will print URL only if not installed)
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

const PORT = 8081;

function getLocalIP() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (_) {}
  return null;
}

let ip;
try {
  ip = getLocalIP();
} catch (_) {
  ip = null;
}
const url = ip ? `exp://${ip}:${PORT}` : `exp://localhost:${PORT}`;

console.log('\n📱 Expo Go URL (enter in Expo Go if needed):');
console.log('   ' + url);
console.log('\nMake sure "npx expo start" is running and your phone is on the same Wi‑Fi.\n');

try {
  const QRCode = require('qrcode');
  const outPath = path.join(__dirname, '..', 'expo-qr.png');
  QRCode.toFile(outPath, url, { width: 280, margin: 2 }, (err) => {
    if (err) {
      console.log('Install "qrcode" to save QR image: npm install --save-dev qrcode');
      return;
    }
    console.log('QR code saved to: expo-qr.png');
    console.log('Open that file and scan it with Expo Go.\n');
  });
} catch (e) {
  console.log('To save a QR image, run: npm install --save-dev qrcode');
  console.log('Then run this script again.\n');
}
