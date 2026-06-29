import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import CartDrawer from "@/components/drawers/CartDrawer";
import SearchDrawer from "@/components/drawers/SearchDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-title",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Voleee | Premium Streetwear & Modern Fashion",
  description: "Experience the next level of fashion with Voleee. Explore our collections of minimalist luxury streetwear, heavyweight cotton tees, structured jackets, and high-end accessories. Crafted for the modern wardrobe.",
  keywords: "Voleee, fashion, luxury streetwear, designer clothing, minimal streetwear, premium tees, hoodies, designer fashion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <MobileMenu />
          <CartDrawer />
          <SearchDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
