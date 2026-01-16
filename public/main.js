let deferredPrompt = null;
let isInstalled = false;

/* ===== Detect install availability ===== */
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

/* ===== Platform detection ===== */
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/* ===== UI helpers ===== */
function showInstallButton() {
  document.getElementById("installBtn").style.display = "block";
}

function hideInstallButton() {
  document.getElementById("installBtn").style.display = "none";
}

/* ===== Install app ===== */
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

/* ===== Register Service Worker ===== */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("✅ Service Worker registered"))
    .catch(err => console.error("❌ SW failed", err));
}

/* ===== DOM ===== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("installBtn").addEventListener("click", installApp);
  hideInstallButton();

  if (isIOS()) showInstallButton();
});
