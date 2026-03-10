# Giftly

A gift card manager PWA that helps you track balances, scan codes, and never lose a card again. All data stays on your device — no server, no account required.

## Features

- **Card Management** — Add gift cards with QR codes or barcodes, organize them into groups
- **Balance Tracking** — Log reload and usage transactions, see remaining balance at a glance
- **QR / Barcode Scanner** — Scan card codes with your camera or enter them manually
- **Code Display** — Show QR codes and barcodes at checkout for easy redemption
- **Encrypted Storage** — Card codes are encrypted with AES-256-GCM via the Web Crypto API
- **Import / Export** — Back up your data as JSON or transfer between devices
- **Dark / Light Theme** — Toggle between themes, defaults to dark
- **Installable PWA** — Works offline, installable on mobile and desktop
- **No Backend** — Everything is stored locally in IndexedDB (via Dexie.js)

## Tech Stack

- **React 19** + TypeScript
- **Vite** with PWA plugin (Workbox)
- **Tailwind CSS v4**
- **Zustand** for state management
- **Dexie.js** for IndexedDB
- **html5-qrcode** for scanning
- **qrcode.react** + **react-barcode** for display

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## License

MIT
