import type { Metadata } from "next";
import { DM_Sans, Fjalla_One } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${fjalla.variable} font-sans antialiased`}>
        <QueryProvider>
          {children}
          <Toaster theme="dark" position="bottom-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
