"use client";

import Header from "@/components/customer/layout/header";
import Footer from "@/components/customer/layout/footer";

export default function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
