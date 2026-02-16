import "./config/env.js";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Base64-encoded images can be large; raise the default limit.
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

const defaultCorsOrigins = ["http://localhost:5173", "http://localhost:5174"];
const corsOriginsFromEnv = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const corsOrigins = corsOriginsFromEnv.length > 0 ? corsOriginsFromEnv : defaultCorsOrigins;

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "chat-app-backend",
    env: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const frontendDistPath = path.join(__dirname, "../frontend/dist");
const frontendIndexPath = path.join(frontendDistPath, "index.html");
const shouldServeFrontend =
  process.env.SERVE_FRONTEND === "true" ||
  (process.env.NODE_ENV === "production" && fs.existsSync(frontendIndexPath));

if (shouldServeFrontend) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(frontendIndexPath);
  });
} else {
  // Helpful when deploying backend separately (Render/Railway/Fly)
  app.get("/", (req, res) => {
    res.status(200).json({
      ok: true,
      service: "chat-app-backend",
      message: "Backend is running. Use /api/health to verify.",
    });
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
