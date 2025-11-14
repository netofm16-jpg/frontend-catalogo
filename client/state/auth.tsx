import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { postJson, decodeJwt } from "@/lib/api";

export type Role = "user" | "admin";
export type User = { id: string; name: string; email: string; role: Role };

const AuthCtx = createContext<{
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string; user?: User }>;
  register: (data: { name: string; email: string; password: string; adminCode?: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  listUsers: () => User[];
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: Role) => void;
} | null>(null);

const AUTH_KEY = "ts_auth";
const AUTH_TOKEN_KEY = "ts_auth_token";


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const api = useMemo(() => ({
    user,
    async login(email: string, password: string) {
      const res = await postJson<any, { email: string; password: string }>("/auth/login", { email, password });
      if (!res.ok) return { ok: false, message: res.message || "Erro ao entrar" };
      // Tenta normalizar respostas comuns: { access_token, token, jwt } e { user }
      const token: string | undefined = res.data?.access_token || res.data?.token || res.data?.jwt;
      const returnedUser: Partial<User> | undefined = res.data?.user || res.data;
      if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
      // normaliza role vindo da API (ADMIN/admin/User -> 'admin' | 'user')
      const normalizedRole = returnedUser?.role ? String(returnedUser.role).toLowerCase() : undefined;
      const roleValue: Role | undefined = normalizedRole === 'admin' ? 'admin' : normalizedRole === 'user' ? 'user' : undefined;
      const safeUser: User | null = returnedUser && returnedUser.id && returnedUser.email && returnedUser.name && roleValue
        ? { id: String(returnedUser.id), email: String(returnedUser.email), name: String(returnedUser.name), role: roleValue }
        : null;
      // fallback: extrai role e dados mínimos do JWT se não veio usuário no payload
      let finalUser: User | null = safeUser;
      if (!finalUser && token) {
        const claims = decodeJwt<any>(token);
        if (claims) {
          const claimRole = String(claims.role ?? claims['https://schemas.quickapp/role'] ?? '').toLowerCase();
          const claimRoleValue: Role | undefined = claimRole === 'admin' ? 'admin' : claimRole === 'user' ? 'user' : undefined;
          const id = String(claims.sub ?? claims.id ?? claims.userId ?? '');
          const email = claims.email ? String(claims.email) : '';
          const name = claims.name ? String(claims.name) : (email ? email.split('@')[0] : 'Usuário');
          if (claimRoleValue && id) {
            finalUser = { id, email, name, role: claimRoleValue };
          }
        }
      }
      if (finalUser) {
        setUser(finalUser);
        localStorage.setItem(AUTH_KEY, JSON.stringify(finalUser));
      }
      return { ok: true, user: finalUser ?? undefined };
    },
    async register(data: { name: string; email: string; password: string; adminCode?: string }) {
      const payload: Record<string, any> = { name: data.name, email: data.email, password: data.password };
      if (data.adminCode) payload.adminCode = data.adminCode;
      const res = await postJson<any, typeof payload>("/auth/register", payload);
      if (!res.ok) return { ok: false, message: res.message || "Erro ao cadastrar" };
      return { ok: true };
    },
    logout() {
      (async () => {
        try {
          // Chama API protegida para invalidar o token no backend
          await postJson<unknown, {}>("/auth/logout", {});
        } catch {
          // ignora falhas de rede; seguirá limpando o storage
        } finally {
          setUser(null);
          try { sessionStorage.clear(); } catch {}
          try { localStorage.clear(); } catch {}
        }
      })();
    },
    // As funções abaixo permanecem mockadas para a aba de Usuários no Admin.
    listUsers() { return []; },
    deleteUser(_id: string) { /* no-op */ },
    updateUserRole(_id: string, _role: Role) { /* no-op */ },
  }), [user]);

  return <AuthCtx.Provider value={api}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
