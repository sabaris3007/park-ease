import app from './app';

// Vercel Serverless Function Catch-All Route
// Handles all /api/* requests (e.g. /api/users/login, /api/centres, /api/reports/*)
export default function handler(req: any, res: any) {
  return app(req, res);
}

