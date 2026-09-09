const test = require("node:test");
const assert = require("node:assert/strict");
const { createAuthStore } = require("../auth-store.js");

function makeStore() {
  const memory = new Map();
  return createAuthStore({
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: key => memory.delete(key)
  });
}

test("registers an email account and logs it in", () => {
  const auth = makeStore();
  const result = auth.register("hello@example.com", "secret123");

  assert.equal(result.ok, true);
  assert.equal(auth.currentUser().email, "hello@example.com");
  assert.equal(auth.isLoggedIn(), true);
});

test("rejects duplicate accounts and invalid credentials", () => {
  const auth = makeStore();
  auth.register("hello@example.com", "secret123");
  auth.logout();

  assert.equal(auth.register("hello@example.com", "another123").code, "DUPLICATE");
  assert.equal(auth.login("hello@example.com", "wrong").code, "INVALID_CREDENTIALS");
});

test("persists and updates a shipping address for the logged-in user", () => {
  const auth = makeStore();
  auth.register("hello@example.com", "secret123");
  const address = {
    recipient: "小林",
    phone: "13800138000",
    detail: "上海市静安区宠物路 8 号"
  };

  assert.equal(auth.saveAddress(address).ok, true);
  assert.deepEqual(auth.currentUser().address, address);
});
