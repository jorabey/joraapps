// ============================================================
// API client
// Wraps fetch with: base URL, auth header injection, automatic
// access-token refresh on 401 via the httpOnly refresh cookie,
// and a small typed error shape matching the server's AppError.
// ============================================================

const BASE_URL = 'https://nexa-server-three.vercel.app/api/v1';

let accessToken = sessionStorage.getItem('accessToken') || null;
let refreshPromise = null;

const listeners = new Set();

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(accessToken));
}

export function setAccessToken(token) {
  accessToken = token;
  if (token) {
    sessionStorage.setItem('accessToken', token);
  } else {
    sessionStorage.removeItem('accessToken');
  }
  notify();
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function rawRequest(path, { method = 'GET', body, headers = {}, skipAuth = false } = {}) {
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth && accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty response */
  }

  if (!res.ok) {
    throw new ApiError(
      data?.message || 'Nomalum xatolik yuz berdi.',
      res.status,
      data?.errorCode
    );
  }
  return data;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = rawRequest('/client/auth/refresh', { method: 'POST', skipAuth: true })
      .then((data) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch((err) => {
        setAccessToken(null);
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function request(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !options.skipAuth && !options._retried) {
      try {
        await refreshAccessToken();
        return await rawRequest(path, { ...options, _retried: true });
      } catch {
        throw err;
      }
    }
    throw err;
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export { refreshAccessToken, BASE_URL };
