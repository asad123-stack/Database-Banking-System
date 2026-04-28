require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connectDb } = require("./config/db");
const { authenticate, requireRole } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/accounts");
const transactionRoutes = require("./routes/transactions");
const adminRoutes = require("./routes/admin");

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", authenticate, accountRoutes);
app.use("/api/transactions", authenticate, transactionRoutes);
app.use("/api/admin", authenticate, requireRole("admin", "analyst"), adminRoutes);

app.use((error, _req, res, _next) => {
  const message = error?.message || "Unexpected server error";
  const code = error?.statusCode || 500;
  res.status(code).json({ error: message });
});

async function start() {
  await connectDb();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server running on http://localhost:${port}`);
  });
}

start();

