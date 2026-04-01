import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "umasCRM - Customer Relationship Management",
  description: "Manage your contacts, track deals, and grow your business with umasCRM.",
  keywords: ["umasCRM", "CRM", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React"],
  authors: [{ name: "umasCRM Team" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "umasCRM",
    description: "Customer Relationship Management for growing businesses",
    url: "https://umascrm1.vercel.app/",
    siteName: "umasCRM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "umasCRM",
    description: "Customer Relationship Management for growing businesses",
  },
};

export const viewport = {
  viewportFit: "cover" as const,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
