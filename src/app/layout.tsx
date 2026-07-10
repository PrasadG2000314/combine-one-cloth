import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

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
  title: "Draven | Premium Streetwear & Modern Fashion",
  description: "Experience the next level of fashion with Draven. Explore our collections of minimalist luxury streetwear, heavyweight cotton tees, structured jackets, and high-end accessories. Crafted for the modern wardrobe.",
  keywords: "Draven, fashion, luxury streetwear, designer clothing, minimal streetwear, premium tees, hoodies, designer fashion",
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
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
