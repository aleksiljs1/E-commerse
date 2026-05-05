import type { Product, Order, OrderItem, Credential, User } from "@prisma/client";

export type { Product, Order, OrderItem, Credential, User };

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
