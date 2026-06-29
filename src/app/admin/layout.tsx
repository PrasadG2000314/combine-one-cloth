import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voleee Storefront | Secure Admin Portal",
  description: "Secure administration panel for managing sales, orders, and dashboard configurations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f5' }}>
      {children}
    </div>
  );
}
