const express = require("express");
const session = require("express-session");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const experienceRoutes = require("./routes/experience.routes");
const adminRoutes = require("./routes/admin.routes");

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

app.use("/auth", authRoutes); // Mount the auth routes at /auth
app.use("/profile", profileRoutes); // Mount the profile routes at /profile
app.use("/experiences", experienceRoutes); // Mount the experience routes at /experiences
app.use("/admin", adminRoutes); // Mount the admin routes at /admin

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

module.exports = app;
