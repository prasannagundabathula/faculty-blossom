/**
 * BVCITS — Per-User Profile Photo Layer
 * -------------------------------------
 * Maps every existing user account (from js/db.js) to its OWN profile photo.
 * There is no "one common student photo": resolution is always per user id.
 *
 * Resolution order for the logged-in (or any) user:
 *   1. user.photoData      → photo uploaded from the Profile page (stored in localStorage DB)
 *   2. user.photo          → explicit photo path saved on the user record
 *   3. PHOTO_MAP[user.id]  → file dropped into public/images/profiles/
 *   4. user.avatar         → legacy field already present in db.js
 *   5. images/bvcits_seal.jpg (final fallback)
 *
 * TO ADD REAL PHOTOS: drop the file into public/images/profiles/ using the exact
 * filename below (no other code change needed).
 */
(function (window) {
  'use strict';

  const DIR = 'images/profiles/';
  const FALLBACK = 'images/bvcits_seal.jpg';

  // userId -> dedicated photo file (one per account)
  const PHOTO_MAP = {
    // Students
    usr_ratnaraju: DIR + 'student-ratnaraju.jpg',
    usr_meenakshi: DIR + 'student-meenakshi.jpg',
    usr_sailakshmi: DIR + 'student-sailakshmi.jpg',
    usr_teja: DIR + 'student-teja.jpg',
    usr_ananya: DIR + 'student-ananya.jpg',
    // Faculty
    usr_murthy: DIR + 'faculty-murthy.jpg',
    usr_narayana: DIR + 'faculty-narayana.jpg',
    // Administration
    usr_admin: DIR + 'faculty-prasad.jpg'
  };

  const Photos = {
    DIR: DIR,
    FALLBACK: FALLBACK,
    map: PHOTO_MAP,

    /** Best available photo URL for a specific user object. */
    resolve(user) {
      if (!user) return FALLBACK;
      return user.photoData || user.photo || PHOTO_MAP[user.id] || user.avatar || FALLBACK;
    },

    /** Chain of fallbacks used by onerror so a missing file never shows broken. */
    fallbackChain(user) {
      if (!user) return [FALLBACK];
      return [user.photoData, user.photo, PHOTO_MAP[user.id], user.avatar, FALLBACK]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i);
    },

    /** Inline onerror attribute value: walks the chain, then gives up. */
    onErrorAttr(user) {
      const chain = JSON.stringify(this.fallbackChain(user)).replace(/"/g, '&quot;');
      return `onerror="window.BVCITSPhotos.handleError(this, ${chain})"`;
    },

    handleError(img, chain) {
      const list = Array.isArray(chain) ? chain : [FALLBACK];
      const idx = list.indexOf(img.getAttribute('src'));
      const next = list[idx + 1];
      if (next) {
        img.setAttribute('src', next);
      } else {
        img.onerror = null;
        img.setAttribute('src', FALLBACK);
      }
    },

    /** Ready-to-inject <img> tag bound to one user's photo. */
    imgTag(user, cls, style, extra) {
      const src = this.resolve(user);
      const name = (user && user.fullName) || 'Profile Photo';
      return `<img src="${src}" alt="${name} profile photo"
        ${cls ? `class="${cls}"` : ''} ${style ? `style="${style}"` : ''}
        ${extra || ''} ${this.onErrorAttr(user)}>`;
    },

    /** Persist an uploaded photo (data URL) against the user id. */
    save(userId, dataUrl) {
      if (window.BVCITSDatabase && window.BVCITSDatabase.updateUserPhoto) {
        window.BVCITSDatabase.updateUserPhoto(userId, dataUrl);
      }
      // keep the active auth session copy in sync so topbar updates immediately
      try {
        const KEY = 'BVCITS_AUTH_SESSION_V2';
        const store = sessionStorage.getItem(KEY) ? sessionStorage : localStorage;
        const raw = store.getItem(KEY);
        if (raw) {
          const session = JSON.parse(raw);
          if (session && session.id === userId) {
            session.photoData = dataUrl;
            store.setItem(KEY, JSON.stringify(session));
          }
        }
      } catch (e) {
        console.warn('Could not sync session photo:', e);
      }
    },

    /**
     * Wires a "change photo" file input to the given user id.
     * inputId: <input type="file">, previewId: <img> to refresh live.
     */
    bindUploader(inputId, previewId, userId, onDone) {
      const input = document.getElementById(inputId);
      if (!input) return;
      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (!/^image\//.test(file.type)) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result);
          Photos.save(userId, dataUrl);
          const preview = document.getElementById(previewId);
          if (preview) preview.src = dataUrl;
          document.querySelectorAll('.user-avatar, .hero-avatar').forEach(img => {
            img.src = dataUrl;
          });
          if (typeof onDone === 'function') onDone(dataUrl);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  window.BVCITSPhotos = Photos;
})(window);
