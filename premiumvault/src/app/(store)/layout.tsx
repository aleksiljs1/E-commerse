import { Navbar } from "@/components/store/Navbar";
import { CartPopup } from "@/components/store/CartPopup";
import { AnnouncementBar } from "@/components/store/AnnouncementBar";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0F1412] text-[#E8F5EE] font-inter min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <CartPopup />
      <main>{children}</main>
    </div>
  );
}
