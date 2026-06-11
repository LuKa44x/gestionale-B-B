import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";

export const metadata: Metadata = {
  title: "Gestionale B&B",
  description: "Gestionale per Bed and Breakfast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <BootstrapClient />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
