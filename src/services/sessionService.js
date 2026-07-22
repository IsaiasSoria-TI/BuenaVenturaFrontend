const STORAGE_KEYS = {
  token: 'token',
  username: 'username',
  user: 'user',
};

export const getToken = () => localStorage.getItem(STORAGE_KEYS.token);

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}');
  } catch {
    return {};
  }
};

export const saveSession = (token, user) => {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.username, user.nombreCompleto || user.usuario || 'Usuario');
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
};

export const updateUser = (changes) => {
  const user = { ...getUser(), ...changes };
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.username, user.nombreCompleto || user.usuario || 'Usuario');
  window.dispatchEvent(new Event('user-updated'));
  return user;
};

export const clearSession = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};
