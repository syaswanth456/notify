const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===== VAPID KEYS (ENV) ===== */
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.error("❌ VAPID keys missing in ENV");
  process.exit(1);
}

webpush.setVapidDetails(
  "mailto:test@example.com",
  publicVapidKey,
  privateVapidKey
);

/* ===== IN-MEMORY STORE ===== */
const subscriptions = {};

/* ===== ROUTES ===== */

// Subscribe (code-based)
app.post("/subscribe", (req, res) => {
  const { code, subscription } = req.body;

  if (!code || !subscription) {
    return res.status(400).json({ error: "Missing code or subscription" });
  }

  subscriptions[code] = subscription;
  console.log("✅ Subscribed:", code);

  res.json({ success: true });
});

// Publish notification
app.post("/send-to-code", async (req, res) => {
  const { code, title, body } = req.body;

  const subscription = subscriptions[code];
  if (!subscription) {
    return res.status(404).json({ error: "Invalid code" });
  }

  const payload = JSON.stringify({
    title: title || "🔔 Notification",
    body: body || "Hello from server"
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Push error:", err);
    res.sendStatus(500);
  }
});

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
