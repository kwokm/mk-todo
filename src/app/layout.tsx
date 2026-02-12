import type { Metadata } from "next";
import { Inter, Fjalla_One } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fjalla = Fjalla_One({
  variable: "--font-fjalla",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "MK-TODO",
  description: "A minimal todo app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${fjalla.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster theme="dark" position="bottom-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
