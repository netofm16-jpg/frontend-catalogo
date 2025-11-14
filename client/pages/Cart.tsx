import { useData } from "@/state/data";
import { useAuth } from "@/state/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { cart, products, setCartQty, removeFromCart } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const items = cart.map((ci) => ({ ...ci, product: products.find((p) => p.id === ci.productId)! }));
  const total = items.reduce((s, it) => s + it.product.price * it.qty, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Seu carrinho</h1>
      {items.length === 0 ? (
        <div className="text-muted-foreground">Seu carrinho está vazio.</div>
      ) : (
        <div className="grid gap-4">
          {items.map((it) => (
            <Card key={it.productId}>
              <CardHeader>
                <CardTitle className="text-base">{it.product.name}</CardTitle>
                <div className="text-xs text-muted-foreground">{it.product.description}</div>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <img src={it.product.image} alt={it.product.name} className="w-28 h-28 object-cover rounded border" />
                <div className="flex-1">
                  <div className="font-semibold">{it.product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                  <div className="mt-2">
                    <label className="text-sm mr-2">Qtd:</label>
                    <input className="w-16 border rounded px-2 py-1" type="number" value={it.qty} min={1} onChange={(e) => setCartQty(it.productId, Number(e.target.value) || 1)} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => removeFromCart(it.productId)}>Remover</Button>
                <div className="ml-auto font-semibold">{(it.product.price * it.qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
              </CardFooter>
            </Card>
          ))}

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
            <div>
              <Button onClick={() => navigate(-1)} variant="outline" className="mr-2">Continuar comprando</Button>
              <Button onClick={() => {
                if (!user) {
                  navigate('/login', { state: { from: '/checkout' } });
                  return;
                }
                navigate('/checkout');
              }}>Finalizar compra</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
