export const API_URL = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:3000";

export async function postJson<TResponse, TBody = unknown>(path: string, body: TBody, init?: RequestInit): Promise<{ ok: boolean; data?: TResponse; message?: string; status: number }>
{
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
      body: JSON.stringify(body),
      credentials: "include",
      ...init,
    });
    const status = res.status;
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json() : undefined;
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Erro ${status}`;
      return { ok: false, message, status };
    }
    return { ok: true, data, status };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Falha de rede", status: 0 };
  }
}

export function decodeJwt<T = any>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export async function getJson<TResponse>(path: string, init?: RequestInit): Promise<{ ok: boolean; data?: TResponse; message?: string; status: number }>
{
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
      credentials: "include",
      ...init,
    });
    const status = res.status;
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json() : undefined;
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Erro ${status}`;
      return { ok: false, message, status };
    }
    return { ok: true, data, status };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Falha de rede", status: 0 };
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("ts_auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function patchJson<TResponse, TBody = unknown>(path: string, body: TBody, init?: RequestInit): Promise<{ ok: boolean; data?: TResponse; message?: string; status: number }>
{
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
      body: JSON.stringify(body),
      credentials: "include",
      ...init,
    });
    const status = res.status;
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json() : undefined;
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Erro ${status}`;
      return { ok: false, message, status };
    }
    return { ok: true, data, status };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Falha de rede", status: 0 };
  }
}

export async function deleteJson<TResponse = any>(path: string, init?: RequestInit): Promise<{ ok: boolean; data?: TResponse; message?: string; status: number }>
{
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: {
        ...authHeaders(),
        ...(init?.headers ?? {}),
      },
      credentials: "include",
      ...init,
    });
    const status = res.status;
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json() : undefined;
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Erro ${status}`;
      return { ok: false, message, status };
    }
    return { ok: true, data, status };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Falha de rede", status: 0 };
  }
}


