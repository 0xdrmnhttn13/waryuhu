# WarYuhu ⚔️

War jatah makan malam — sistem antrian tiket.

## Run Local

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build Production

```bash
npm run build
npm run preview
```

## Catatan

- Data disimpan di `localStorage` browser (per-device, ga shared antar user).
- Kalo mau shared antar user / multi-device, perlu backend. Pilihan cepet: Go + SQLite + REST/WebSocket, atau Rust + Axum + Redis. Tinggal ganti bagian `loadQueue`, `handleSubmit`, `handleReset` jadi `fetch` call.

## Stack

- Vite + React 18
- Tailwind CSS
- lucide-react (icons)
