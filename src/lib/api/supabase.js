import { SUPABASE_URL, SUPABASE_KEY } from './config';

const defaultHeaders = {
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
};

const authHeaders = {
  apikey: SUPABASE_KEY,
  'Content-Type': 'application/json',
};

async function handleResponse(response) {
  if (!response.ok) {
    if (response.status === 204) { // No Content, for logout
      return null;
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    
    const error = new Error(errorData.error_description || errorData.message || 'Ocorreu um erro na API');
    error.status = response.status;
    error.data = errorData;

    if (response.status === 401) {
        error.message = 'Sessão inválida ou expirada. Por favor, faça login novamente.';
    }

    throw error;
  }
  if (response.status === 204) {
      return null;
  }
  if (response.headers.get('Content-Type')?.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export async function apiGet(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'GET',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  });
  return handleResponse(response);
}

export async function apiPost(path, body, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'Prefer': 'return=representation',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(response);
}

export async function apiGenericPost(url, body, options = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(response);
}

export async function apiAuthPost(path, body, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
  return handleResponse(response);
}

export async function apiPatch(path, body, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: {
      ...defaultHeaders,
      'Prefer': 'return=minimal',
      ...options.headers,
    },
    body: JSON.stringify(body),
    ...options,
  });
   if (!response.ok) {
     await handleResponse(response)
   }
  return true;
}

export async function apiAuthDelete(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'DELETE',
    headers: {
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  });
  return handleResponse(response);
}
