import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/providers/ThemeProviderWrapper";
import { Toaster } from "@/components/ui/sonner";
import { DbProvider } from "@/contexts/DbContext";
import { DbLoadingBar } from "@/components/ui/DbLoadingBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Toronto Bike Thefts",
  description: "A map of bike theft activity in Toronto, ON"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen bg-white`}
      >
        <ThemeProviderWrapper>
          <DbProvider>
            {children}
            <Toaster />
            <DbLoadingBar />
          </DbProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
