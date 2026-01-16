const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const subscriptions = {};

app.post("/subscribe", (req, res) => {
  const { code, subscription } = req.body;
  subscriptions[code] = subscription;
  res.json({ success: true });
});

app.post("/send-to-code", (req, res) => {
  const { code, title, body } = req.body;
  res.json({ success: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
