//
const express = require("express");
const session = require("express-session");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

module.exports = app;