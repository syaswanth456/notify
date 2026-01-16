const publicVapidKey = "BMsYkxK0g0izE9IfkQRE8DqnRnPFoo4M1Mim7RgExSkU6ZBIgxoZo0IddHNKjkJI5XlL5_uRBbLf_KVYcYsP55w";
let registration;

// Ask permission
async function requestPermission() {
  const permission = await Notification.requestPermission();
  alert(permission === "granted" ? "Permission granted" : "Permission denied");
}

// Subscribe & generate code
async function subscribe() {
  if (Notification.permission !== "granted") {
    alert("Allow notifications first");
    return;
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  registration = await navigator.serviceWorker.register("/sw.js");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });

  await fetch("/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subscription })
  });

  document.getElementById("code").innerText =
    "Your Code: " + code;
}

// Publish notification
async function publish() {
  const code = document.getElementById("publishCode").value;
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  await fetch("/send-to-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, title, body })
  });
}

// Helper
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

let deferredPrompt;

// Capture install prompt
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
});

// Trigger install
async function installApp() {
  if (!deferredPrompt) {
    alert("Install not available yet");
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt = null;
}

