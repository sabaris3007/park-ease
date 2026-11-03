import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import app, { RUNTIME_DB_PATH } from './api/app';

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(import.meta.dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(import.meta.dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ParkEase Full-Stack Server] running on http://0.0.0.0:${PORT}`);
    console.log(`[SQLite DBMS] connected to: ${RUNTIME_DB_PATH}`);
  });
}

startServer();
