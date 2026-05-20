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
  title: "OPPY - Réseau Social d'Opportunités",
  description:
    "Découvrez et partagez des opportunités professionnelles. Le réseau social qui connecte les talents aux opportunités.",
  keywords: [
    "OPPY",
    "opportunités",
    "réseau social",
    "professionnel",
    "carrière",
    "emploi",
    "networking",
  ],
  authors: [{ name: "OPPY" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>",
  },
  openGraph: {
    title: "OPPY - Réseau Social d'Opportunités",
    description:
      "Découvrez et partagez des opportunités professionnelles. Le réseau social qui connecte les talents aux opportunités.",
    siteName: "OPPY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OPPY - Réseau Social d'Opportunités",
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
