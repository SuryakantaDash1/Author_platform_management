// Vercel serverless entry point. Vercel's @vercel/node builder compiles this file
// (and the TypeScript it imports) and uses the default export as the request
// handler. An Express app is itself a (req, res) handler, so we export it directly.
import app from '../src/app';

// Allow long-running requests (e.g. Cloudinary uploads). Hobby plan max is 60s.
export const config = {
  maxDuration: 60,
};

export default app;
