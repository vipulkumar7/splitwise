import "./globals.css";
import AuthProvider from "@/providers/SessionProvider";
import InstallPrompt from "@/pwa/InstallPrompt";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Splitwise",
  description: "Split expenses easily",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Analytics />
          <BottomNav />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}