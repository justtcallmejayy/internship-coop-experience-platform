const express = require("express");
const session = require("express-session");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const experienceRoutes = require("./routes/experience.routes");
const adminRoutes = require("./routes/admin.routes");
const browseRoutes = require("./routes/browse.routes");
const referenceRoutes = require("./routes/reference.routes");
const cors = require("cors");
const connectPgSimple = require("connect-pg-simple")(session);

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET || "dev-secret-change-later";

if (isProduction && sessionSecret === "dev-secret-change-later") {
  throw new Error("SESSION_SECRET must be configured in production.");
}

// Configure CORS middleware to let the server know that this is a cross-origin request and to allow credentials (cookies) to be sent with requests. The origin is set to the client URL, which can be configured via environment variables.
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// Configure session middleware (session setup)
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: isProduction
      ? new connectPgSimple({
          conString: process.env.DATABASE_URL,
          createTableIfMissing: true,
        })
      : undefined,
    cookie: {
      httpOnly: true,
      secure: isProduction,
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
app.use("/browse", browseRoutes); // Mount the browse routes at /browse
app.use("/reference", referenceRoutes); // Mount the reference routes at /reference

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

module.exports = app;
