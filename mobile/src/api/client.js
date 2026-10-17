import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

const REFRESH_KEY = 'refreshToken';
const TIMEOUT_MS = 12000;

let accessToken = null; // kept in memory only
let refreshPromise = null; // makes sure only one refresh runs at a time
let onSessionExpired = () => {};

export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function rawRequest(path, { method = 'GET', body, auth = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_URL + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (res.status === 204) return null;
    let data = null;
    try {
      data = await res.json();
    } catch {}
    if (!res.ok) {
      const e = data?.error;
      throw new ApiError(
        res.status,
        e?.code || 'SERVER_ERROR',
        e?.message || 'Something went wrong',
        e?.fields
      );
    }
    return data;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      0,
      'NETWORK',
      e?.name === 'AbortError'
        ? 'The server took too long to respond.'
        : 'Cannot reach the server. Check your internet and the address in src/config.js.'
    );
  } finally {
    clearTimeout(timer);
  }
}

async function saveSession(data) {
  accessToken = data.accessToken;
  await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
}

async function clearSession() {
  accessToken = null;
  try {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {}
}

// Swap the stored refresh token for a fresh pair of tokens
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const token = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'No saved session');
      try {
        const data = await rawRequest('/auth/refresh', {
          method: 'POST',
          body: { refreshToken: token },
        });
        await saveSession(data);
        return data;
      } catch (e) {
        if (e.status === 401) await clearSession(); // dead token; keep it on network errors
        throw e;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Use this for every request that needs the user to be logged in.
// If the access token has expired, it refreshes once and retries.
export async function authedRequest(path, options = {}) {
  try {
    return await rawRequest(path, { ...options, auth: true });
  } catch (e) {
    if (e.status === 401 && (e.code === 'TOKEN_EXPIRED' || !accessToken)) {
      try {
        await refreshSession();
      } catch (refreshError) {
        if (refreshError.status === 401) onSessionExpired();
        throw refreshError;
      }
      return rawRequest(path, { ...options, auth: true });
    }
    throw e;
  }
}

function deviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

export async function registerRequest({ name, email, password }) {
  const data = await rawRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password, timezone: deviceTimezone() },
  });
  await saveSession(data);
  return data.user;
}

export async function loginRequest({ email, password }) {
  const data = await rawRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  await saveSession(data);
  return data.user;
}

// Returns the user if a saved session still works, otherwise null
export async function restoreSession() {
  const token = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!token) return null;
  try {
    const data = await refreshSession();
    return data.user;
  } catch {
    return null;
  }
}

export async function logoutRequest() {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_KEY);
    if (token) {
      await rawRequest('/auth/logout', {
        method: 'POST',
        body: { refreshToken: token },
      });
    }
  } catch {} // even if the server can't be reached, we still sign out on the phone
  await clearSession();
}