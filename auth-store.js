(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = { createAuthStore: factory };
  } else {
    root.PettreatsAuth = factory(root.localStorage);
  }
})(typeof window !== "undefined" ? window : globalThis, function (storage) {
  const USERS_KEY = "pettreats.users";
  const SESSION_KEY = "pettreats.session";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function readUsers() {
    try {
      return JSON.parse(storage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writeUsers(users) {
    storage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function getCurrentEmail() {
    return storage.getItem(SESSION_KEY);
  }

  return {
    register(email, password, address = null) {
      const normalizedEmail = normalizeEmail(email);
      if (!emailPattern.test(normalizedEmail)) return { ok: false, code: "INVALID_EMAIL" };
      if (String(password || "").length < 6) return { ok: false, code: "SHORT_PASSWORD" };
      const users = readUsers();
      if (users.some(user => user.email === normalizedEmail)) return { ok: false, code: "DUPLICATE" };

      users.push({ email: normalizedEmail, password: String(password), address });
      writeUsers(users);
      storage.setItem(SESSION_KEY, normalizedEmail);
      return { ok: true };
    },

    login(email, password) {
      const normalizedEmail = normalizeEmail(email);
      const user = readUsers().find(entry => entry.email === normalizedEmail && entry.password === String(password || ""));
      if (!user) return { ok: false, code: "INVALID_CREDENTIALS" };
      storage.setItem(SESSION_KEY, normalizedEmail);
      return { ok: true };
    },

    logout() {
      storage.removeItem(SESSION_KEY);
    },

    currentUser() {
      const email = getCurrentEmail();
      return readUsers().find(user => user.email === email) || null;
    },

    isLoggedIn() {
      return Boolean(this.currentUser());
    },

    saveAddress(address) {
      const email = getCurrentEmail();
      const users = readUsers();
      const user = users.find(entry => entry.email === email);
      if (!user) return { ok: false, code: "NOT_LOGGED_IN" };
      if (!address.recipient || !address.phone || !address.detail) return { ok: false, code: "INCOMPLETE_ADDRESS" };
      user.address = {
        recipient: String(address.recipient).trim(),
        phone: String(address.phone).trim(),
        detail: String(address.detail).trim()
      };
      writeUsers(users);
      return { ok: true };
    }
  };
});
