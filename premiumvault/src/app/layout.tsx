import type { Metadata } from "next";
import { Inter, Rajdhani, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const rajdhani = Rajdhani({ weight: "700", subsets: ["latin"], variable: "--font-rajdhani", display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "PremiumVault — Account Upgrade Services",
  description: "Upgrade your streaming accounts to premium instantly.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${rajdhani.variable} ${plusJakarta.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
