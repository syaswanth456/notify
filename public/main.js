let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
});

// Detect platform
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isUnsupportedBrowser() {
  return !("BeforeInstallPromptEvent" in window);
}

async function installApp() {
  // iOS → manual install
  if (isIOS()) {
    alert("On iPhone:\nSafari → Share → Add to Home Screen");
    return;
  }

  // Unsupported browsers (Comet, etc.)
  if (!deferredPrompt) {
    alert(
      "Install not supported in this browser.\n\n" +
      "Please use Chrome or Edge for app installation."
    );
    return;
  }

  deferredPrompt.prompt();
  deferredPrompt = null;
}
