import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kartly: Shop everyday essentials", template: "%s | Kartly" },
  description: "Kartly is a fast, ad-free place to find, compare and buy everyday products.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body id="top" className="flex min-h-screen flex-col antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
