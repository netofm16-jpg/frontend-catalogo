import { useAuth } from "@/state/auth";
import { useData } from "@/state/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Account() {
  const { user } = useAuth();
  const { orders, syncOrders } = useData();
  const location = useLocation();

  useEffect(() => {
    // could handle orderId in state after checkout
    if (location.state && (location.state as any).orderId) {
      // noop for now
    }
    // sincroniza pedidos do backend
    syncOrders().catch(() => {});
  }, [location.state]);

  if (!user) return <div>Por favor, faça login.</div>;

  const myOrders = orders.filter((o) => o.userId === user.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Minha conta</h1>
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nome</div>
              <div className="font-semibold">{user.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">E-mail</div>
              <div className="font-semibold">{user.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold">Meus pedidos</h2>
        {myOrders.length === 0 ? (
          <div className="text-muted-foreground">Você ainda não realizou compras.</div>
        ) : (
          <div className="grid gap-3">
            {myOrders.map((o) => (
              <Card key={o.id}>
                <CardHeader>
                  <CardTitle>Pedido {o.id.slice(0, 8)}</CardTitle>
                  <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {o.items.map((it) => (
                      <div key={it.productId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-muted-foreground">Qtd: {it.qty}</div>
                        </div>
                        <div className="font-semibold">{(it.price * it.qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                      </div>
                    ))}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <div className="font-bold">Total</div>
                      <div className="font-bold">{o.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
