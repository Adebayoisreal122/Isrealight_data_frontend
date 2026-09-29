export type Role = 'user' | 'agent' | 'admin';
export type TxStatus = 'pending' | 'success' | 'failed';
export type TxType = 'airtime' | 'data' | 'cable' | 'electricity';

// All money fields from the API are in KOBO unless noted.
export interface User { id: string; name: string; email: string; phone: string; role: Role; balance: number }
export interface Tx {
  _id: string; reference: string; type: TxType; serviceID: string; variationCode?: string; recipient: string;
  amount: number; status: TxStatus; refunded: boolean; token?: string; note?: string; createdAt: string;
  providerResponse?: unknown; user?: { name: string; email: string; phone: string };
}
export interface Plan {
  _id: string; serviceID: string; variationCode: string; name: string;
  providerPrice: number; userPrice: number; agentPrice: number; isActive: boolean;
}
export interface LedgerEntry {
  _id: string; type: 'credit' | 'debit'; purpose: string; amount: number; balanceAfter: number; createdAt: string; note?: string;
}
export interface AdminUser {
  _id: string; name: string; email: string; phone: string; role: Role; balance: number; isActive: boolean; createdAt: string;
}

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'ihub_token';

export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY));
export const setToken = (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

interface Options { method?: string; body?: unknown; headers?: Record<string, string> }

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method: opts.method || (opts.body ? 'POST' : 'GET'),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts.headers,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError('Network error. Check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      setToken(null);
      window.dispatchEvent(new Event('ihub:logout'));
    }
    const detail = Array.isArray(data.errors) ? data.errors.map((e: { message: string }) => e.message).join(', ') : '';
    throw new ApiError(detail || data.message || 'Something went wrong', res.status);
  }
  return data as T;
}
