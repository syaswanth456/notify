const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const publicVapidKey = process.env.PUBLIC_VAPID_KEY || "PASTE_PUBLIC_VAPID_KEY";
const privateVapidKey = process.env.PRIVATE_VAPID_KEY || "PASTE_PRIVATE_VAPID_KEY";

webpush.setVapidDetails(
  "mailto:test@example.com",
  publicVapidKey,
  privateVapidKey
);

const subscriptions = {};

app.post("/subscribe", (req, res) => {
  const { code, subscription } = req.body;
  if (!code || !subscription) {
    return res.status(400).json({ error: "Missing code or subscription" });
  }
  subscriptions[code] = subscription;
  res.json({ success: true });
});

app.post("/send-to-code", async (req, res) => {
  const { code, title, body } = req.body;
  const subscription = subscriptions[code];

  if (!subscription) {
    return res.status(404).json({ error: "Invalid code" });
  }

  const payload = JSON.stringify({
    title: title || "🔔 Notification",
    body: body || "Hello from Render"
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
