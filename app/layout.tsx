import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import Navbar from "@/components/shared/navbar";
import BottomNav from "@/components/ui/BottomNav";

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
          <BottomNav />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}