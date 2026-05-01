import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ColorSchemeProvider } from "@/components/color-scheme-provider";
import { AuthProvider } from "@/lib/auth";
import { GoogleProvider } from "@/components/auth/google-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthLayout } from "@/components/auth/auth-layout";
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
  title: "WatchTogether",
  description:
    "A clean, minimal watchlist app for sharing movie & series lists with your partner or friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem("watchtogether-color-scheme");var v=["violet","blue","emerald","rose","amber"].indexOf(s)>=0?s:"violet";document.documentElement.dataset.colorScheme=v})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ColorSchemeProvider>
            <GoogleProvider>
              <AuthProvider>
                <AuthGuard>
                  <AuthLayout>{children}</AuthLayout>
                </AuthGuard>
              </AuthProvider>
            </GoogleProvider>
          </ColorSchemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
