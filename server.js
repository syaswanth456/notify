const express = require("express");
const path = require("path");
const webpush = require("web-push");

const app = express();
const PORT = process.env.PORT || 3000;

/* ========== MIDDLEWARE ========== */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ========== ENV VARIABLES ========== */
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

if (!publicVapidKey || !privateVapidKey) {
  console.error("❌ VAPID keys missing in environment variables");
  process.exit(1);
}

/* ========== WEB PUSH SETUP ========== */
webpush.setVapidDetails(
  "mailto:admin@example.com",
  publicVapidKey,
  privateVapidKey
);

/* ========== IN-MEMORY STORAGE ========== */
const subscriptions = {}; // code -> subscription

/* ========== ROUTES ========== */

// Subscribe user
app.post("/subscribe", (req, res) => {
  const { code, subscription } = req.body;

  if (!code || !subscription) {
    return res.status(400).json({ error: "Invalid request" });
  }

  subscriptions[code] = subscription;
  console.log("✅ Subscribed:", code);

  res.json({ success: true });
});

// Send push notification
app.post("/send-to-code", async (req, res) => {
  const { code, title, body } = req.body;

  const subscription = subscriptions[code];
  if (!subscription) {
    return res.status(404).json({ error: "Code not found" });
  }

  const payload = JSON.stringify({
    title: title || "🔔 Notification",
    body: body || "Hello from PWA"
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Push failed:", err);
    res.sendStatus(500);
  }
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ========== START SERVER ========== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
