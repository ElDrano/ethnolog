import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import "./sidebar.css";
import SidebarNav from "./SidebarNav";
import DarkModeToggle from "./DarkModeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethnographic Methods",
  description: "",
  icons: {
    icon: [
      { url: '/iconLupe.png', sizes: 'any' },
      { url: '/iconLupe.png', type: 'image/png' },
    ],
    shortcut: '/iconLupe.png',
    apple: '/iconLupe.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/iconLupe.png" type="image/png" />
        <link rel="shortcut icon" href="/iconLupe.png" type="image/png" />
        <link rel="apple-touch-icon" href="/iconLupe.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <SidebarNav />
          <main style={{ flex: 1, padding: '2rem', background: 'var(--background)', position: 'relative' }}>
            <DarkModeToggle />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
