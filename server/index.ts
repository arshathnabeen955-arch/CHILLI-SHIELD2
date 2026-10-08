import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

async function startServer() {
  const app = express();
  const server = createServer(app);

  // AI model bridge
  app.post(
    "/api/real-model/infer",
    upload.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error: "No image file received.",
          });
        }

        const formData = new FormData();

        formData.append(
          "file",
          new Blob([req.file.buffer], {
            type: req.file.mimetype,
          }),
          req.file.originalname || "image"
        );

        const response = await fetch(
          "http://127.0.0.1:8000/predict",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          return res.status(502).json({
            error: "Python AI API returned an error.",
            details: errorText,
          });
        }

        const prediction = await response.json();

        return res.json(prediction);
      } catch (error) {
        console.error("AI bridge error:", error);

        return res.status(503).json({
          error: "Unable to connect to the Python AI model.",
        });
      }
    }
  );

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);