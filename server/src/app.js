const express = require("express");
const session = require("express-session");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

// Configure session middleware (session setup)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-later", // In production, use a session secure secret from environment variables.
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    },
  }),
);
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/auth", authRoutes); //connects auth routes to the app.

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

module.exports = app;
