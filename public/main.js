const publicVapidKey = "BMsYkxK0g0izE9IfkQRE8DqnRnPFoo4M1Mim7RgExSkU6ZBIgxoZo0IddHNKjkJI5XlL5_uRBbLf_KVYcYsP55w";

let registration;
let deferredPrompt = null;
let isInstalled = false;

/* ================= INSTALL HANDLING ================= */

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

window.addEventListener("appinstalled", () => {
  isInstalled = true;
  deferredPrompt = null;
  hideInstallButton();
});

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function showInstallButton() {
  document.getElementById("installBtn").style.display = "block";
}

function hideInstallButton() {
  document.getElementById("installBtn").style.display = "none";
}

async function installApp() {
  if (isIOS()) {
    alert("iPhone:\nSafari → Share → Add to Home Screen");
    return;
  }

  if (!deferredPrompt) {
    alert("Install not supported in this browser.\nUse Chrome or Edge.");
    return;
  }

  deferredPrompt.prompt();
  deferredPrompt = null;
  hideInstallButton();
}

/* ================= PUSH NOTIFICATION ================= */

async function requestPermission() {
  const permission = await Notification.requestPermission();
  alert(permission === "granted" ? "Permission granted" : "Permission denied");
}

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

  document.getElementById("code").innerText = "Your Code: " + code;
}

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

/* ================= HELPERS ================= */

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

/* ================= INIT ================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("allowBtn").addEventListener("click", requestPermission);
  document.getElementById("subscribeBtn").addEventListener("click", subscribe);
  document.getElementById("publishBtn").addEventListener("click", publish);
  document.getElementById("installBtn").addEventListener("click", installApp);

  hideInstallButton();
  if (isIOS()) showInstallButton();
});
