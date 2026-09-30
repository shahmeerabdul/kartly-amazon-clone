import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Header } from "@/components/header/header";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kartly: Shop everyday essentials", template: "%s | Kartly" },
  description: "Kartly is a fast, ad-free place to find, compare and buy everyday products.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body id="top" className="flex min-h-screen flex-col antialiased">
        <Header />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
