import { Navbar } from "@/components/store/Navbar";
import { CartPopup } from "@/components/store/CartPopup";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0f] text-white font-inter min-h-screen">
      <Navbar />
      <CartPopup />
      <main>{children}</main>
    </div>
  );
}
