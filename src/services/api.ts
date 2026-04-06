const rawBase = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';
const API_BASE = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('finance_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// Auth API
export const authApi = {
  signIn: (username: string, password: string) =>
    apiFetch('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  signUp: (username: string, adminPassword: string, viewerPassword: string) =>
    apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, adminPassword, viewerPassword })
    }),

  getMe: () => apiFetch('/auth/me')
};

// Transactions API
export const transactionsApi = {
  getAll: () => apiFetch('/transactions'),

  create: (transaction: {
    date: string;
    amount: number;
    category: string;
    description: string;
    type: 'income' | 'expense';
    cardId?: string;
  }) =>
    apiFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction)
    }),

  update: (id: string, transaction: {
    date?: string;
    amount?: number;
    category?: string;
    description?: string;
    type?: 'income' | 'expense';
    cardId?: string;
  }) =>
    apiFetch(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction)
    }),

  delete: (id: string) =>
    apiFetch(`/transactions/${id}`, { method: 'DELETE' })
};

// Cards API
export const cardsApi = {
  getAll: () => apiFetch('/cards'),

  create: (card: {
    nickname: string;
    type: 'visa' | 'mastercard' | 'amex' | 'other';
    last4: string;
    expiry: string;
    balance: number;
    color: string;
  }) =>
    apiFetch('/cards', {
      method: 'POST',
      body: JSON.stringify(card)
    }),

  update: (id: string, card: {
    nickname?: string;
    balance?: number;
    color?: string;
  }) =>
    apiFetch(`/cards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(card)
    }),

  delete: (id: string) =>
    apiFetch(`/cards/${id}`, { method: 'DELETE' })
};

