import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OQUI - Réseau Social d'Opportunités",
  description:
    "Découvrez et partagez des opportunités professionnelles. Le réseau social qui connecte les talents aux opportunités.",
  keywords: [
    "OQUI",
    "opportunités",
    "réseau social",
    "professionnel",
    "carrière",
    "emploi",
    "networking",
  ],
  authors: [{ name: "OQUI" }],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "OQUI - Réseau Social d'Opportunités",
    description:
      "Découvrez et partagez des opportunités professionnelles. Le réseau social qui connecte les talents aux opportunités.",
    siteName: "OQUI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OQUI - Réseau Social d'Opportunités",
    description:
      "Découvrez et partagez des opportunités professionnelles. Le réseau social qui connecte les talents aux opportunités.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              className: "toast-custom",
              style: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
