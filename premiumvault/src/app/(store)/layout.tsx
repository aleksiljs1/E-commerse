import { Navbar } from "@/components/store/Navbar";
import { CartPopup } from "@/components/store/CartPopup";
import { Footer } from "@/components/store/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0f] text-white font-inter min-h-screen flex flex-col">
      <Navbar />
      <CartPopup />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
