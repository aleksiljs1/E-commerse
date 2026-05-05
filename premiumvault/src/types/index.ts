import type { Product, Order, OrderItem, Credential, User } from "@prisma/client";

export type { Product, Order, OrderItem, Credential, User };

// Product with Decimal price serialized to number (safe to pass to client components)
export type SerializedProduct = Omit<Product, "price"> & { price: number };

export type ProductWithItems = Product & { orderItems: OrderItem[] };

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product;
    credentials: Credential[];
  })[];
  credentials: Credential[];
};

export type CartItem = {
  productId: string;
  title: string;
  description: string;
  price: number;
  logoUrl: string | null;
  serviceType: string;
  quantity: number;
};

export type CheckoutPayload = {
  email: string;
  paymentMethod: "STRIPE" | "PAYPAL";
  items: { productId: string; quantity: number }[];
};

export type CredentialSubmission = {
  orderItemId: string;
  serviceType: string;
  username: string;
  password: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    };
  }
}
