import app from './app';

// Vercel Serverless Function Entrypoint for /api and /api/
export default function handler(req: any, res: any) {
  return app(req, res);
}
