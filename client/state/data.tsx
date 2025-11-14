import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getJson, postJson, patchJson, deleteJson } from "@/lib/api";

export type Category = { id: string; name: string };
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  featured?: boolean;
  published?: boolean;
};

export type CartItem = { productId: string; qty: number };
export type PaymentMethod = "pix" | "credit" | "debit";
export type Order = { id: string; userId: string; items: Array<{ productId: string; qty: number; price: number; name: string }>; total: number; paymentMethod?: PaymentMethod; createdAt: string };

const CATEGORIES_KEY = "ts_categories";
const PRODUCTS_KEY = "ts_products";
const SEARCH_KEY = "ts_search";
const ACTIVE_CAT_KEY = "ts_active_cat";
const CART_KEY = "ts_cart";
const ORDERS_KEY = "ts_orders";

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const DataCtx = createContext<{
  categories: Category[];
  products: Product[];
  search: string;
  activeCategory: string;
  cart: CartItem[];
  orders: Order[];
  setSearch: (q: string) => void;
  setActiveCategory: (id: string) => void;
  addCategory: (name: string) => Promise<{ ok: boolean; message?: string }>;
  updateCategory: (id: string, name: string) => Promise<{ ok: boolean; message?: string }>;
  deleteCategory: (id: string) => Promise<{ ok: boolean; message?: string }>;
  addOrUpdateProduct: (p: Product) => Promise<{ ok: boolean; message?: string }>;
  deleteProduct: (id: string) => Promise<{ ok: boolean; message?: string }>;
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (userId: string, paymentMethod: PaymentMethod) => Promise<Order | null>;
  listOrders: () => Order[];
  syncOrders: () => Promise<void>;
} | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Inicializa categorias e produtos a partir da API (com fallback local para produtos)
    (async () => {
      // Fetch categorias do backend
      const res = await getJson<Category[]>("/categories");
      if (res.ok && Array.isArray(res.data)) {
        setCategories(res.data);
        write(CATEGORIES_KEY, res.data);
      } else {
        // fallback: use cache local se houver
        const cached = read<Category[]>(CATEGORIES_KEY, []);
        setCategories(cached);
      }

      // Fetch produtos do backend (fallback: cache local)
      const resProd = await getJson<any[]>("/products");
      if (resProd.ok && Array.isArray(resProd.data)) {
        const mapped = resProd.data.map(mapApiProductToProduct);
        setProducts(mapped);
        write(PRODUCTS_KEY, mapped);
      } else {
        setProducts(read<Product[]>(PRODUCTS_KEY, []));
      }

      setSearch(read<string>(SEARCH_KEY, ""));
      setActiveCategory(read<string>(ACTIVE_CAT_KEY, ""));
      setCart(read<CartItem[]>(CART_KEY, []));
      setOrders(read<Order[]>(ORDERS_KEY, []));
    })();
  }, []);

  useEffect(() => write(CATEGORIES_KEY, categories), [categories]);
  useEffect(() => write(PRODUCTS_KEY, products), [products]);
  useEffect(() => write(SEARCH_KEY, search), [search]);
  useEffect(() => write(ACTIVE_CAT_KEY, activeCategory), [activeCategory]);
  useEffect(() => write(CART_KEY, cart), [cart]);
  useEffect(() => write(ORDERS_KEY, orders), [orders]);

  const api = useMemo(() => ({
    categories,
    products,
    search,
    activeCategory,
    cart,
    orders,
    setSearch,
    setActiveCategory,
    async addCategory(name: string) {
      const res = await postJson<Category, { name: string }>("/categories", { name });
      if (res.ok && res.data) {
        setCategories((c) => [...c, res.data!]);
        return { ok: true };
      }
      return { ok: false, message: res.message };
    },
    async updateCategory(id: string, name: string) {
      const res = await patchJson<Category, { name: string }>(`/categories/${id}`, { name });
      if (res.ok && res.data) {
        setCategories((list) => list.map((c) => (c.id === id ? res.data! : c)));
        return { ok: true };
      }
      return { ok: false, message: res.message };
    },
    async deleteCategory(id: string) {
      const res = await deleteJson<{ deleted: boolean }>(`/categories/${id}`);
      if (res.ok) {
        setCategories((list) => list.filter((c) => c.id !== id));
        // opcional: remover products da categoria deletada
        setProducts((list) => list.filter((p) => p.categoryId !== id));
        return { ok: true };
      }
      return { ok: false, message: res.message };
    },
    async addOrUpdateProduct(p: Product) {
      // Decide create vs update conforme presença de id no estado
      if (!p.id) {
        const body = { name: p.name, description: p.description, price: p.price, image: p.image, categoryId: p.categoryId, featured: !!p.featured, published: !!p.published };
        const res = await postJson<any, typeof body>("/products", body);
        if (res.ok && res.data) {
          const mapped = mapApiProductToProduct(res.data);
          setProducts((list) => [mapped, ...list]);
          return { ok: true };
        }
        return { ok: false, message: res.message };
      } else {
        const body = { name: p.name, description: p.description, price: p.price, image: p.image, categoryId: p.categoryId, featured: !!p.featured, published: !!p.published };
        const res = await patchJson<any, typeof body>(`/products/${p.id}`, body);
        if (res.ok && res.data) {
          const mapped = mapApiProductToProduct(res.data);
          setProducts((list) => list.map((x) => (x.id === p.id ? mapped : x)));
          return { ok: true };
        }
        return { ok: false, message: res.message };
      }
    },
    async deleteProduct(id: string) {
      const res = await deleteJson<{ deleted: boolean }>(`/products/${id}`);
      if (res.ok) {
        setProducts((list) => list.filter((p) => p.id !== id));
        // also remove from cart
        setCart((c) => c.filter((item) => item.productId !== id));
        return { ok: true };
      }
      return { ok: false, message: res.message };
    },
    addToCart(productId: string, qty = 1) {
      setCart((c) => {
        const idx = c.findIndex((i) => i.productId === productId);
        if (idx >= 0) {
          const copy = [...c];
          copy[idx].qty = Math.max(1, copy[idx].qty + qty);
          return copy;
        }
        return [...c, { productId, qty }];
      });
    },
    removeFromCart(productId: string) {
      setCart((c) => c.filter((i) => i.productId !== productId));
    },
    setCartQty(productId: string, qty: number) {
      setCart((c) => c.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i)));
    },
    clearCart() {
      setCart([]);
    },
    async placeOrder(userId: string, paymentMethod: PaymentMethod) {
      // envia apenas productId e quantity conforme API NestJS
      const body = {
        items: cart.map((ci) => ({ productId: ci.productId, quantity: ci.qty })),
        paymentMethod,
      };
      const res = await postJson<any, typeof body>("/orders", body);
      if (res.ok && res.data) {
        const mapped = mapApiOrderToOrder(res.data, userId);
        setOrders((o) => [mapped, ...o]);
        setCart([]);
        return mapped;
      }
      return null;
    },
    listOrders() {
      return orders;
    },
    async syncOrders() {
      const res = await getJson<any[]>("/orders/my");
      if (res.ok && Array.isArray(res.data)) {
        const mapped = res.data.map((o) => mapApiOrderToOrder(o));
        setOrders(mapped);
      }
    },
  }), [categories, products, search, activeCategory, cart, orders]);

  return <DataCtx.Provider value={api}>{children}</DataCtx.Provider>;
}

export function useData() {
  const ctx = useContext(DataCtx);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

function normalizeImageStr(value?: string | null): string {
  if (!value) return "";
  const v = String(value);
  if (v.startsWith("data:image/")) return v;
  if (/^https?:\/\//i.test(v)) return v;
  // assume raw base64 without prefix
  return `data:image/jpeg;base64,${v}`;
}

function mapApiProductToProduct(api: any): Product {
  return {
    id: String(api.id ?? api._id ?? ""),
    name: String(api.name ?? api.nome ?? ""),
    description: String(api.description ?? api.descricao ?? ""),
    price: Number(api.price ?? api.preco ?? 0),
    image: normalizeImageStr(api.imagem ?? api.image ?? api.imageBase64 ?? api.foto ?? ""),
    categoryId: String(api.category?.id ?? api.categoryId ?? api.categoriaId ?? ""),
    featured: Boolean(api.featured ?? api.destaque ?? false),
    published: Boolean(api.published ?? api.publicado ?? false),
  };
}

function mapApiOrderToOrder(api: any, fallbackUserId?: string): Order {
  const items = Array.isArray(api.items) ? api.items.map((it: any) => ({
    productId: String(it.product?.id ?? it.productId ?? ""),
    qty: Number(it.quantity ?? it.qty ?? 0),
    price: Number(it.unitPrice ?? it.price ?? 0),
    name: String(it.product?.name ?? it.name ?? ""),
  })) : [];
  const total = typeof api.total === 'number' ? api.total : Number(api.total ?? 0);
  const paymentMethod = (api.paymentMethod ?? api.pagamento ?? undefined) as PaymentMethod | undefined;
  const createdAt = typeof api.createdAt === 'string' ? api.createdAt : (api.createdAt?.toString?.() ?? new Date().toISOString());
  const userId = String(api.user?.id ?? api.userId ?? fallbackUserId ?? "");
  return { id: String(api.id ?? api._id ?? ""), userId, items, total, paymentMethod, createdAt };
}
