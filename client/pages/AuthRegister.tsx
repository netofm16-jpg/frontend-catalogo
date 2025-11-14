import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/state/auth";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await register({ name, email, password });
    setLoading(false);
    if (!res.ok) return toast.error(res.message ?? "Erro ao cadastrar");
    toast.success("Conta criada! Faça login.");
    navigate("/login");
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <div className="rounded-lg border p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {/* Campo de admin removido: registros sempre entram com role 'user' */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "Criar"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4">
          Já tem conta? <Link to="/login" className="underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
