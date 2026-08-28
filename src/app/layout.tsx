import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Providers from "@/components/Providers";
import ConvexClientProvider from '@/components/ConvexClientProvider';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "RC Rush | Drive. Race. Repeat.",
  description: "Discover nearby RC tracks, book experiences, and race your friends.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Providers>
          <ConvexClientProvider>
            <div className="container">
              {children}
            </div>
            <BottomNav />
          </ConvexClientProvider>
        </Providers>
      </body>
    </html>
  );
}
