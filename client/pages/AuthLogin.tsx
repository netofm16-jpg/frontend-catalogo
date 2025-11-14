import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/state/auth";
import { decodeJwt } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) return toast.error(res.message ?? "Erro ao entrar");
    toast.success("Bem-vindo!");
    const token = localStorage.getItem('ts_auth_token');
    const claims = token ? decodeJwt<any>(token) : null;
    const role = claims?.role ? String(claims.role).toLowerCase() : res.user?.role;
    if (role === 'admin') navigate('/admin'); else navigate('/');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <div className="rounded-lg border p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4">
          Novo aqui? <Link to="/registrar" className="underline">Crie sua conta</Link>
        </p>
        {/* Removido hint hardcoded para evitar confusão após integrar com backend */}
      </div>
    </div>
  );
}
