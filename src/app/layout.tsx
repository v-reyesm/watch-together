import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ColorSchemeProvider } from "@/components/color-scheme-provider";
import { AuthProvider } from "@/lib/auth";
import { GoogleProvider } from "@/components/auth/google-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AuthLayout } from "@/components/auth/auth-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "WatchTogether",
  description:
    "App para listas compartidas de películas y series con tu pareja o amigos",
  applicationName: "WatchTogether",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "WatchTogether",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#be123c",
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
            __html: `(function(){var s=localStorage.getItem("watchtogether-color-scheme");var m={emerald:"bosque",rose:"rosita",blue:"indigo",violet:"ciruela",amber:"arena"};s=m[s]||s;var a=["rosita","lila","bosque","terracota","arena","indigo","tinta","cereza","ciruela","aqua","oliva","rosa"];var v=a.indexOf(s)>=0?s:"rosita";document.documentElement.dataset.colorScheme=v})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
