import { useMemo, useState } from "react";
import { useData } from "@/state/data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ImageMagnifier } from "@/components/ImageMagnifier";

export default function Index() {
  const { products, categories, search, activeCategory, addToCart } = useData();
  const [selected, setSelected] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const visible = useMemo(() => {
    return products.filter((p) => {
      // only show published products on public pages
      if (!p.published) return false;
      const byCat = activeCategory ? p.categoryId === activeCategory : true;
      const bySearch = search
        ? [p.name, p.description].some((x) => x.toLowerCase().includes(search.toLowerCase()))
        : true;
      return byCat && bySearch;
    });
  }, [products, search, activeCategory]);

  const featured = useMemo(() => products.filter((p) => p.featured && p.published), [products]);

  const selProduct = selected ? products.find((p) => p.id === selected) ?? null : null;

  return (
    <div className="space-y-10">
      <section className="rounded-xl bg-gradient-to-br from-primary/15 via-accent/20 to-transparent p-8 border">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <Badge className="mb-3">Novo</Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Catálogo de Produtos – Celulares, Acessórios e Tecnologia
            </h1>
            <p className="mt-3 text-muted-foreground">
              Descubra ofertas em smartphones, fones, carregadores e gadgets. Tudo em um só lugar.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#catalogo" className="inline-flex">
                <Button size="lg">Ver catálogo</Button>
              </a>
              <a href="#destaques" className="inline-flex">
                <Button size="lg" variant="outline">Destaques</Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <FeaturedCarousel images={featured.map((p) => p.image)} className="h-56 md:h-72" removeBackground />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section id="destaques" className="space-y-4">
          <h2 className="text-xl font-bold">Destaques</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} {...p} categoryName={categories.find((c) => c.id === p.categoryId)?.name || ""} onDetails={() => { setSelected(p.id); setQty(1); }} onAdd={() => addToCart(p.id, 1)} />
            ))}
          </div>
        </section>
      )}

      <section id="catalogo" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">Catálogo</h2>
          <span className="text-sm text-muted-foreground">{visible.length} produtos</span>
        </div>
        <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {visible.map((p) => (
            <ProductCard key={p.id} {...p} categoryName={categories.find((c) => c.id === p.categoryId)?.name || ""} onDetails={() => { setSelected(p.id); setQty(1); }} onAdd={() => addToCart(p.id, 1)} />
          ))}
        </div>
        {visible.length === 0 && (
          <div className="text-center text-muted-foreground border rounded-md p-8">Nenhum produto encontrado</div>
        )}
      </section>

      <Dialog open={!!selProduct} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selProduct && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selProduct.name}</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-2">
                <ImageMagnifier src={selProduct.image} alt={selProduct.name} />
              </div>
              <div className="p-2">
                <div className="text-muted-foreground mb-2">{categories.find((c) => c.id === selProduct.categoryId)?.name}</div>
                <div className="text-2xl font-bold mb-2">{currency(selProduct.price)}</div>
                <p className="text-sm text-muted-foreground mb-4">{selProduct.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm">Qtd:</label>
                  <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} className="w-20 border rounded px-2 py-1" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => { addToCart(selProduct.id, qty); setSelected(null); }}>Adicionar ao carrinho</Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function currency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ProductCard({ name, description, price, image, categoryName, onDetails, onAdd }: { name: string; description: string; price: number; image: string; categoryName: string; onDetails: () => void; onAdd: () => void; }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">{name}</CardTitle>
        <div className="text-xs text-muted-foreground">{categoryName}</div>
      </CardHeader>
      <CardContent>
        <div className="aspect-square rounded-md border bg-muted/20 grid place-items-center overflow-hidden">
          <img src={image} alt={name} className="object-cover w-full h-full" />
        </div>
        <div className="mt-3 font-semibold text-lg">{currency(price)}</div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button className="flex-1" onClick={onAdd}>Adicionar</Button>
        <Button variant="outline" className="flex-1" onClick={onDetails}>Detalhes</Button>
      </CardFooter>
    </Card>
  );
}
