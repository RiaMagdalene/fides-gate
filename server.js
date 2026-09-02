import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 10000;

const frontendPath = path.join(
  __dirname,
  "artifacts",
  "fides-gate",
  "dist",
  "public"
);

// Send /api/* to the Fides Gate API
app.use(
  "/api",
  createProxyMiddleware({
    target: "https://fides-gate-api.onrender.com",
    changeOrigin: true,
    secure: true,
  })
);

// Serve React
app.use(express.static(frontendPath));

// React routing fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Fides Gate running on port ${PORT}`);
});
