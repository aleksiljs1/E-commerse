import { Navbar } from "@/components/store/Navbar";
import { CartSheet } from "@/components/store/CartSheet";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartSheet />
      <main className="pt-16">{children}</main>
    </>
  );
}
