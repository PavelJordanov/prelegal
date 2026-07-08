import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Only takes effect under `next dev` (port 3000) — ignored by the static
  // export that Docker builds and serves from FastAPI on port 8000, where
  // API calls are already same-origin. Lets `npm run dev` reach a backend
  // started separately (e.g. `uv run uvicorn app.main:app --port 8000`).
  async rewrites() {
    return [{ source: "/api/:path*", destination: "http://localhost:8000/api/:path*" }];
  },
};

export default nextConfig;
