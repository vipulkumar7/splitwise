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
    icon: "/icons/splitwise-icon.svg",
    shortcut: "/icons/splitwise-icon.svg",
    apple: "/icons/splitwise-icon.svg",
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
          {children}
          <Analytics />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
