'use strict';

/**
 * Auth — модуль никнейма для NEON ARCADE.
 * Хранит имя игрока в localStorage. Используется для лидерборда.
 * Без пароля, без регистрации — просто ник.
 */
const Auth = (() => {
  const KEY = 'neon_player';

  function validate(name) {
    if (typeof name !== 'string') return false;
    const t = name.trim();
    return t.length >= 2 && t.length <= 20 && /^[a-zA-Z0-9_\-]+$/.test(t);
  }

  return {
    /** Получить текущий никнейм или null */
    get()      { return localStorage.getItem(KEY) || null; },

    /** Сохранить никнейм. Возвращает true если валидный. */
    set(name)  {
      const t = (name || '').trim();
      if (!validate(t)) return false;
      localStorage.setItem(KEY, t);
      return true;
    },

    /** Очистить никнейм */
    clear()    { localStorage.removeItem(KEY); },

    /** Есть ли сохранённый валидный никнейм */
    isValid()  { return !!this.get(); },

    /** Проверить строку на допустимость (2-20, a-z 0-9 _ -) */
    validate,
  };
})();

window.Auth = Auth;