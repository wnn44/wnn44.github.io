'use strict';

const Auth = (() => {
  const USERS_KEY = 'neon_users';
  const SESSION_KEY = 'neon_session';

  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '::neon_salt_v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function validateUsername(name) {
    if (typeof name !== 'string') return 'Некорректное имя';
    const t = name.trim();
    if (t.length < 3) return 'Логин минимум 3 символа';
    if (t.length > 20) return 'Логин максимум 20 символов';
    if (!/^[a-zA-Z0-9_\-]+$/.test(t)) return 'Только латиница, цифры, _ и -';
    return null;
  }

  function validatePassword(pwd) {
    if (typeof pwd !== 'string') return 'Некорректный пароль';
    if (pwd.length < 4) return 'Пароль минимум 4 символа';
    if (pwd.length > 64) return 'Пароль максимум 64 символа';
    return null;
  }

  return {
    async register(username, password) {
      const uErr = validateUsername(username);
      if (uErr) return { ok: false, error: uErr };
      const pErr = validatePassword(password);
      if (pErr) return { ok: false, error: pErr };
      const users = loadUsers();
      const uname = username.trim();
      if (users[uname]) return { ok: false, error: 'Пользователь уже существует' };
      users[uname] = { hash: await hashPassword(password), created: Date.now(), games: {} };
      saveUsers(users);
      return { ok: true };
    },

    async login(username, password) {
      const uErr = validateUsername(username);
      if (uErr) return { ok: false, error: uErr };
      if (!password) return { ok: false, error: 'Введите пароль' };
      const users = loadUsers();
      const uname = username.trim();
      const user = users[uname];
      if (!user) return { ok: false, error: 'Пользователь не найден' };
      const hash = await hashPassword(password);
      if (hash !== user.hash) return { ok: false, error: 'Неверный пароль' };
      localStorage.setItem(SESSION_KEY, uname);
      return { ok: true, username: uname };
    },

    logout() { localStorage.removeItem(SESSION_KEY); },

    currentUser() {
      const uname = localStorage.getItem(SESSION_KEY);
      if (!uname) return null;
      const users = loadUsers();
      return users[uname] ? uname : null;
    },

    getBest(gameId) {
      const u = this.currentUser();
      if (!u) return 0;
      const users = loadUsers();
      return (users[u]?.games?.[gameId]) || 0;
    },

    setBest(gameId, score) {
      const u = this.currentUser();
      if (!u) return;
      const users = loadUsers();
      if (!users[u]) return;
      if (!users[u].games) users[u].games = {};
      const cur = users[u].games[gameId] || 0;
      if (score > cur) {
        users[u].games[gameId] = score;
        saveUsers(users);
      }
    },

    isSessionValid() { return this.currentUser() !== null; },

    requireAuth(redirectUrl = 'index.html') {
      if (!this.isSessionValid()) {
        window.location.replace(redirectUrl);
        return false;
      }
      return true;
    },

    getDisplayName() { return this.currentUser() || 'Гость'; }
  };
})();

window.Auth = Auth;