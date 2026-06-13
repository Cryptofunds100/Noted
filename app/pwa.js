/* Noted — PWA glue (plain JS, loads before React).
   Exposes window.NotedPWA. Everything is guarded so a non-secure context
   (e.g. the in-editor preview) degrades gracefully instead of throwing. */
(function () {
  'use strict';

  // ── VAPID public key ──────────────────────────────────────────────────────
  // Paste the *public* key from `npx web-push generate-vapid-keys` here, and set
  // VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY as Vercel env vars (see README).
  // Empty → the app runs in "local notifications" mode: the reminder UI still
  // works, but pushes can't be delivered while the app is closed.
  const VAPID_PUBLIC_KEY = 'BLWULO7iuGSUMLk9_nG2dioLdGJrc2Gl06P9Ukbs3msI_GnihTTr0yC6Y5JHvchBRYIwJg51ig1nml0_HmmSvZk';

  const API = '/api'; // serverless routes (Vercel deploys this app at the root)

  const state = {
    registration: null,
    deferredInstall: null, // captured beforeinstallprompt event
    installable: false,
    initialAction: null,   // ?action= from a manifest shortcut or push tap
  };

  // ── installed / standalone detection ──────────────────────────────────────
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches ||
           window.navigator.standalone === true;
  }
  function isIOS() {
    return (/iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
           // iPadOS reports as Mac — detect by touch support
           (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) &&
           !window.MSStream;
  }
  function isIOSSafari() {
    if (!isIOS()) return false;
    const ua = window.navigator.userAgent;
    // Exclude Chrome/Firefox/Edge on iOS (CriOS/FxiOS/EdgiOS) — only real Safari
    // (and home-screen WebViews) can register push on iOS.
    return !/crios|fxios|edgios|opios/i.test(ua);
  }

  // ── read deep-link intent from the launch URL ─────────────────────────────
  try {
    const action = new URLSearchParams(window.location.search).get('action');
    if (action) state.initialAction = action;
  } catch (e) { /* ignore */ }

  function emitAction(action) {
    window.dispatchEvent(new CustomEvent('noted:action', { detail: { action } }));
  }

  // ── service worker ────────────────────────────────────────────────────────
  async function registerSW() {
    if (!('serviceWorker' in navigator)) return null;
    if (!window.isSecureContext) return null; // needs https / localhost
    try {
      const reg = await navigator.serviceWorker.register('sw.js', { scope: './' });
      state.registration = reg;
      navigator.serviceWorker.addEventListener('message', (ev) => {
        if (ev.data && ev.data.type === 'notification-open') {
          try {
            const a = new URL(ev.data.url, window.location.href).searchParams.get('action');
            if (a) emitAction(a);
          } catch (e) { /* ignore */ }
        }
      });
      return reg;
    } catch (e) {
      console.warn('[Noted] SW registration failed:', e && e.message);
      return null;
    }
  }

  function ready() {
    if (state.registration) return Promise.resolve(state.registration);
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);
    // navigator.serviceWorker.ready never settles when registration failed
    // (e.g. an insecure preview) — race a short timeout so callers don't hang.
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
  }

  // ── feature detection ─────────────────────────────────────────────────────
  function notificationsSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }
  function pushSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
  function notificationPermission() {
    return notificationsSupported() ? Notification.permission : 'unsupported';
  }
  function pushConfigured() {
    return !!VAPID_PUBLIC_KEY;
  }

  // ── permission (must be called from a user gesture) ───────────────────────
  async function requestPermission() {
    if (!notificationsSupported()) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    try { return await Notification.requestPermission(); }
    catch (e) { return 'denied'; }
  }

  // Back-compat: request permission + best-effort push subscription.
  async function enableNotifications() {
    const perm = await requestPermission();
    if (perm !== 'granted') return perm;
    try { await subscribeToPush(); } catch (e) { /* local notifications still work */ }
    return 'granted';
  }

  // ── local notification (fallback / immediate feedback) ────────────────────
  async function showLocalNotification(title, options) {
    if (notificationPermission() !== 'granted') return false;
    const reg = await ready();
    if (reg && reg.showNotification) {
      await reg.showNotification(title || 'Noted', Object.assign({
        icon: 'assets/icons/icon-192.png',
        badge: 'assets/icons/icon-192.png',
        tag: 'noted-reminder',
      }, options || {}));
      return true;
    }
    if ('Notification' in window) {
      const opts = Object.assign({}, options || {});
      delete opts.actions; // non-persistent notifications reject actions
      new Notification(title || 'Noted', opts);
      return true;
    }
    return false;
  }

  // ── push subscription ─────────────────────────────────────────────────────
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }

  async function subscribeToPush() {
    if (!VAPID_PUBLIC_KEY) return null;
    const reg = await ready();
    if (!reg || !reg.pushManager) return null;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;
    return reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  async function getExistingSubscription() {
    const reg = await ready();
    if (!reg || !reg.pushManager) return null;
    try { return await reg.pushManager.getSubscription(); } catch (e) { return null; }
  }

  // ── server sync ───────────────────────────────────────────────────────────
  // Push the latest reminder preferences (+ subscription) to the backend.
  // Returns { ok, configured, local, reason }.
  async function syncReminders(prefs) {
    if (notificationPermission() !== 'granted') return { ok: false, reason: 'permission' };
    if (!VAPID_PUBLIC_KEY) return { ok: true, configured: false, local: true };
    let sub;
    try { sub = await subscribeToPush(); } catch (e) { return { ok: false, reason: 'subscribe' }; }
    if (!sub) return { ok: false, reason: 'subscribe' };
    try {
      const res = await fetch(API + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, prefs }),
      });
      return { ok: res.ok, configured: true, status: res.status };
    } catch (e) {
      return { ok: false, reason: 'network' };
    }
  }

  // Stop server-side reminders. Keeps the browser push subscription so
  // re-enabling is instant.
  async function disableReminders() {
    if (!VAPID_PUBLIC_KEY) return { ok: true, local: true };
    try {
      const sub = await getExistingSubscription();
      if (sub && sub.endpoint) {
        await fetch(API + '/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      return { ok: true };
    } catch (e) {
      return { ok: false };
    }
  }

  // Fire a real test push end-to-end; fall back to a local notification when no
  // backend is configured (or it errors). Returns { ok, server, message }.
  async function sendTest(prefs) {
    if (notificationPermission() !== 'granted') {
      return { ok: false, message: 'Turn on notifications first.' };
    }
    if (VAPID_PUBLIC_KEY) {
      try {
        const sub = await subscribeToPush();
        if (sub) {
          // Make sure the server has us on file before asking it to send.
          await fetch(API + '/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub, prefs }),
          }).catch(() => {});
          const res = await fetch(API + '/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub, endpoint: sub.endpoint }),
          });
          if (res.ok) return { ok: true, server: true };
        }
      } catch (e) { /* fall through to local */ }
    }
    const shown = await showLocalNotification('Noted', {
      body: 'Time for a quick check-in. Logging takes under 30 seconds.',
      data: { url: 'Noted.html?action=log&source=push' },
      actions: [
        { action: 'log', title: 'Log a symptom' },
        { action: 'dismiss', title: 'Not now' },
      ],
    });
    return { ok: shown, server: false, message: shown ? null : 'Couldn’t show a notification on this device.' };
  }

  // Back-compat helper used by older code paths.
  function sendTestReminder() {
    return sendTest({});
  }

  // ── install prompt ────────────────────────────────────────────────────────
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredInstall = e;
    state.installable = true;
    window.dispatchEvent(new CustomEvent('noted:installable'));
  });
  window.addEventListener('appinstalled', () => {
    state.deferredInstall = null;
    state.installable = false;
    window.dispatchEvent(new CustomEvent('noted:installed'));
  });

  async function promptInstall() {
    if (!state.deferredInstall) return 'unavailable';
    state.deferredInstall.prompt();
    const choice = await state.deferredInstall.userChoice;
    state.deferredInstall = null;
    state.installable = false;
    return choice && choice.outcome ? choice.outcome : 'dismissed';
  }

  window.NotedPWA = {
    isStandalone,
    isIOS,
    isIOSSafari,
    get initialAction() { return state.initialAction; },
    clearInitialAction() { state.initialAction = null; },
    registerSW,
    notificationsSupported,
    pushSupported,
    notificationPermission,
    pushConfigured,
    requestPermission,
    enableNotifications,
    showLocalNotification,
    subscribeToPush,
    syncReminders,
    disableReminders,
    sendTest,
    sendTestReminder,
    get installable() { return state.installable; },
    promptInstall,
  };

  // Register as soon as the page is interactive.
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', registerSW);
  } else {
    registerSW();
  }
})();
