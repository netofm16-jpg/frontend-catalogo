/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type Role = "user" | "admin";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  featured?: boolean;
  published?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{ productId: string; qty: number; price: number; name: string }>;
  total: number;
  createdAt: string;
}
