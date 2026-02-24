/* ============================================================
   GAMEFORGE — AUTHENTICATION MODULE
   ============================================================ */
'use strict';

GF.auth = {
  _user: null,

  /** Initialize auth listener — call once on every page */
  init(onLoggedIn, onLoggedOut) {
    auth.onAuthStateChanged(user => {
      this._user = user;
      if (user) {
        console.log('[Auth] Signed in:', user.email);
        if (onLoggedIn) onLoggedIn(user);
      } else {
        console.log('[Auth] Signed out');
        if (onLoggedOut) onLoggedOut();
      }
    });
  },

  /** Require authentication — redirect to index if not logged in */
  requireAuth(redirectPath = 'index.html') {
    return new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        unsub();
        if (!user) {
          window.location.href = redirectPath;
        } else {
          this._user = user;
          resolve(user);
        }
      });
    });
  },

  /** Redirect away from auth pages if already logged in */
  requireGuest(redirectPath = 'dashboard.html') {
    return new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(user => {
        unsub();
        if (user) {
          // Check if they have a save
          GF.db.hasSave(user.uid).then(has => {
            window.location.href = has ? redirectPath : 'setup.html';
          });
        } else {
          resolve();
        }
      });
    });
  },

  /** Register with email + password */
  async register(email, password, displayName) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName });
    this._user = cred.user;

    // Create user profile doc
    await db.collection('users').doc(cred.user.uid).set({
      displayName,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return cred.user;
  },

  /** Login with email + password */
  async login(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    this._user = cred.user;
    return cred.user;
  },

  /** Logout */
  async logout() {
    if (GF.engine) GF.engine.pause();
    await auth.signOut();
    window.location.href = 'index.html';
  },

  /** Get current user (or null) */
  currentUser() {
    return this._user || auth.currentUser;
  },

  /** Get current user UID */
  uid() {
    return this._user?.uid || auth.currentUser?.uid || null;
  },

  /** Send password reset email */
  async resetPassword(email) {
    await auth.sendPasswordResetEmail(email);
  },

  /** Translate Firebase auth error codes to readable messages */
  errorMessage(code) {
    const map = {
      'auth/email-already-in-use':    'That email is already registered.',
      'auth/invalid-email':           'Please enter a valid email address.',
      'auth/user-not-found':          'No account found with that email.',
      'auth/wrong-password':          'Incorrect password. Try again.',
      'auth/too-many-requests':       'Too many attempts. Please wait a moment.',
      'auth/weak-password':           'Password must be at least 6 characters.',
      'auth/network-request-failed':  'Network error. Check your connection.',
      'auth/user-disabled':           'This account has been disabled.',
      'auth/invalid-credential':      'Invalid credentials. Please try again.'
    };
    return map[code] || 'An error occurred. Please try again.';
  }
};

console.log('[Auth] Module ready');
