import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import CartDrawer from "@/components/drawers/CartDrawer";
import SearchDrawer from "@/components/drawers/SearchDrawer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <MobileMenu />
      <CartDrawer />
      <SearchDrawer />
      <main>{children}</main>
      <Footer />
    </>
  );
}
