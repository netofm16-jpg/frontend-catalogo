import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/state/auth";
import { useData } from "@/state/data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { categories, setSearch, activeCategory, setActiveCategory, cart } = useData();
  const [q, setQ] = useState("");

  return (
    <header className="border-b bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="container py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
          <span className="inline-block h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">LP</span>
          <span>LP Tech</span>
        </Link>
        <div className="hidden md:flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-xl">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearch(q);
              }}
              placeholder="Buscar por produtos, marcas..."
              className="pl-3 pr-10"
            />
            <Button size="sm" className="absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setSearch(q)}>
              Buscar
            </Button>
          </div>
        </div>
        <nav className="ml-auto hidden sm:flex items-center gap-4 text-sm">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}>Início</NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}>Admin</NavLink>
          )}
          <NavLink to="/cart" className={({ isActive }) => (isActive ? "text-primary font-semibold flex items-center gap-2" : "text-muted-foreground hover:text-foreground flex items-center gap-2")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 7h13l-2-7" />
            </svg>
            Carrinho
            {cart.length > 0 && <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-destructive-foreground text-destructive">{cart.reduce((s, i) => s + i.qty, 0)}</span>}
          </NavLink>
          {!user && (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}>Entrar</NavLink>
              <NavLink to="/registrar" className={({ isActive }) => (isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground")}>Cadastrar</NavLink>
            </>
          )}
          {!!user && (
            <>
              <NavLink to="/account" className="text-muted-foreground hover:text-foreground">Olá, {user.name}</NavLink>
              <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>Sair</Button>
            </>
          )}
        </nav>
      </div>
      <div className="container pb-3 flex flex-wrap gap-2">
        <Badge
          variant={activeCategory === "" ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => setActiveCategory("")}
        >
          Todas
        </Badge>
        {categories.map((c) => (
          <Badge
            key={c.id}
            variant={activeCategory === c.id ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(c.id)}
          >
            {c.name}
          </Badge>
        ))}
      </div>
    </header>
  );
}
