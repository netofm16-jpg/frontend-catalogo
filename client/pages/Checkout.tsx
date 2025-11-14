import { useData } from "@/state/data";
import { useAuth } from "@/state/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { PaymentMethod } from "@/state/data";

export default function Checkout() {
  const { cart, products, placeOrder } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [method, setMethod] = useState<PaymentMethod>("pix");

  if (!user) {
    navigate('/login', { state: { from: location.pathname } });
    return null;
  }

  const items = cart.map((ci) => ({ ...ci, product: products.find((p) => p.id === ci.productId)! }));
  const total = items.reduce((s, it) => s + it.product.price * it.qty, 0);

  async function onPay() {
    try {
      const order = await placeOrder(user.id, method);
      if (!order) return toast.error('Erro ao processar pagamento');
      toast.success('Pagamento realizado com sucesso');
      navigate('/account', { state: { orderId: order.id } });
    } catch (err) {
      toast.error('Erro ao processar pagamento');
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Resumo da compra</h1>
      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((it) => (
            <div key={it.productId} className="flex items-center gap-4">
              <img src={it.product.image} alt={it.product.name} className="w-20 h-20 object-cover rounded border" />
              <div className="flex-1">
                <div className="font-semibold">{it.product.name}</div>
                <div className="text-sm text-muted-foreground">{it.qty} x {it.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
              <div className="font-semibold">{(it.qty * it.product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="font-bold">Total</div>
            <div className="font-bold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Forma de pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="grid gap-3">
            <div className="flex items-center gap-3">
              <RadioGroupItem id="pay-pix" value="pix" />
              <Label htmlFor="pay-pix">Pix</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem id="pay-credit" value="credit" />
              <Label htmlFor="pay-credit">Cartão de crédito</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem id="pay-debit" value="debit" />
              <Label htmlFor="pay-debit">Cartão de débito</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/cart')}>Voltar ao carrinho</Button>
        <Button onClick={onPay}>Pagar agora</Button>
      </div>
    </div>
  );
}
