import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/AuthLogin";
import Register from "./pages/AuthRegister";
import Admin from "./pages/Admin";
import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import { Layout } from "./components/layout/Layout";
import { AuthProvider, useAuth } from "./state/auth";
import { DataProvider } from "./state/data";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registrar" element={<Register />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
