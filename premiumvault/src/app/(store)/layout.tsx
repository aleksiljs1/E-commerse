import { Navbar } from "@/components/store/Navbar";
import { CartPopup } from "@/components/store/CartPopup";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartPopup />
      <main className="pt-16">{children}</main>
    </>
  );
}
