import { useData } from "@/state/data";
import { useAuth } from "@/state/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Admin() {
  const { user, listUsers, updateUserRole, deleteUser } = useAuth();
  const users = listUsers();
  const { categories, addCategory, updateCategory, deleteCategory, products, addOrUpdateProduct, deleteProduct } = useData();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<{ id: string; name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [deletingCat, setDeletingCat] = useState(false);

  const [catName, setCatName] = useState("");

  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: categories[0]?.id ?? "",
    featured: false,
    published: false,
  });

  function resetProduct() {
    setForm({ id: "", name: "", description: "", price: "", image: "", categoryId: categories[0]?.id ?? "", featured: false, published: false });
  }

  function onSelectImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((f) => ({ ...f, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  function formatBRL(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseBRLToNumber(masked: string): number {
    const digits = masked.replace(/\D/g, '');
    const cents = parseInt(digits || '0', 10);
    return cents / 100;
  }

  function onPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '');
    const cents = parseInt(digits || '0', 10);
    const masked = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    setForm({ ...form, price: masked });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administração</h1>
        <div className="text-sm text-muted-foreground">Logado como {user?.name}</div>
      </div>

      <Tabs defaultValue="produtos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{form.id ? "Editar produto" : "Novo produto"}</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input id="price" inputMode="numeric" value={form.price} onChange={onPriceChange} placeholder="R$ 0,00" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Imagem</Label>
                <Input id="image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="URL da imagem ou use o arquivo abaixo" />
                <Input id="imageFile" type="file" accept="image/*" onChange={onSelectImage} />
                {form.image ? (
                  <img src={form.image} alt="Pré-visualização" className="mt-2 h-32 w-full object-cover rounded border" />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input id="featured" type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  <Label htmlFor="featured">Destaque</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="published" type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                  <Label htmlFor="published">Publicar</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={async () => {
                if (!form.name || !form.price || !form.categoryId) return toast.error("Preencha os campos obrigatórios");
                const product = {
                  id: form.id || "",
                  name: form.name,
                  description: form.description,
                  price: parseBRLToNumber(form.price),
                  image: form.image || "/placeholder.svg",
                  categoryId: form.categoryId,
                  featured: form.featured,
                  published: form.published,
                };
                const res = await addOrUpdateProduct(product as any);
                if (!res.ok) return toast.error(res.message ?? (form.id ? "Erro ao atualizar produto" : "Erro ao criar produto"));
                toast.success(form.id ? "Produto atualizado" : "Produto criado");
                resetProduct();
              }}>Salvar</Button>
              {form.id && (
                <Button variant="outline" onClick={resetProduct}>Cancelar</Button>
              )}
            </CardFooter>
          </Card>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <div className="text-xs text-muted-foreground">R$ {p.price.toFixed(2)}</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded border" />
                  <div className="text-sm text-muted-foreground">{p.description}</div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" onClick={() => setForm({ id: p.id, name: p.name, description: p.description, price: formatBRL(p.price), image: p.image, categoryId: p.categoryId, featured: !!p.featured, published: !!p.published })}>Editar</Button>
                  <Button size="sm" variant={p.published ? undefined : "secondary"} onClick={async () => { const res = await addOrUpdateProduct({ ...p, published: !p.published } as any); if (!res.ok) return toast.error(res.message ?? "Erro ao atualizar publicação"); toast.success(p.published ? "Produto despublicado" : "Produto publicado"); }}>{p.published ? "Despublicar" : "Publicar"}</Button>
                  <Button size="sm" variant="destructive" onClick={async () => { const res = await deleteProduct(p.id); if (!res.ok) return toast.error(res.message ?? "Erro ao remover produto"); toast.success("Produto removido"); }}>Excluir</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nova categoria</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-[1fr_auto] gap-3">
              <div className="space-y-2">
                <Label htmlFor="catName">Nome</Label>
                <Input id="catName" value={catName} onChange={(e) => setCatName(e.target.value)} />
              </div>
              <div className="self-end">
                <Button onClick={async () => {
                  if (!catName) return toast.error("Informe o nome");
                  const res = await addCategory(catName);
                  if (!res.ok) return toast.error(res.message ?? "Erro ao criar categoria");
                  setCatName("");
                  toast.success("Categoria criada");
                }}>Adicionar</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <Card key={c.id}>
                <CardHeader className="flex-row items-center justify-between py-3">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCat({ id: c.id, name: c.name });
                        setEditName(c.name);
                        setEditOpen(true);
                      }}
                      aria-label="Editar categoria"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeletingCatId(c.id);
                        setDeleteOpen(true);
                      }}
                      aria-label="Excluir categoria"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">ID: {c.id.slice(0, 8)}...</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Modal de Editar Categoria */}
          <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingCat(null); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="editName">Nome</Label>
                <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingCat}>Cancelar</Button>
                <Button
                  onClick={async () => {
                    if (!editingCat) return;
                    const name = editName.trim();
                    if (!name || name === editingCat.name) return;
                    setSavingCat(true);
                    const res = await updateCategory(editingCat.id, name);
                    setSavingCat(false);
                    if (!res.ok) return toast.error(res.message ?? "Erro ao atualizar categoria");
                    toast.success("Categoria atualizada");
                    setEditOpen(false);
                    setEditingCat(null);
                  }}
                  disabled={savingCat || !editName.trim()}
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de Confirmação de Exclusão */}
          <AlertDialog open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) { setDeletingCatId(null); } }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
              </AlertDialogHeader>
              <p className="text-sm text-muted-foreground">Essa ação é irreversível. Produtos associados serão removidos.</p>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deletingCat}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (!deletingCatId) return;
                    setDeletingCat(true);
                    const res = await deleteCategory(deletingCatId);
                    setDeletingCat(false);
                    if (!res.ok) return toast.error(res.message ?? "Erro ao excluir categoria");
                    toast.success("Categoria excluída");
                    setDeleteOpen(false);
                    setDeletingCatId(null);
                  }}
                  disabled={deletingCat}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Usuários cadastrados</h3>
            <div className="text-sm text-muted-foreground">Total: {users.length}</div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {users.map((u) => (
              <div key={u.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-sm text-muted-foreground">{u.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">Role: <span className="font-medium">{u.role}</span></div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {u.role !== 'admin' ? (
                    <Button size="sm" onClick={() => { updateUserRole(u.id, 'admin'); toast.success('Promovido a admin'); }}>
                      Promover
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { updateUserRole(u.id, 'user'); toast.success('Rebaixado para usuário'); }}>
                      Rebaixar
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => { if (confirm('Excluir usuário?')) { deleteUser(u.id); toast.success('Usuário excluído'); } }}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
