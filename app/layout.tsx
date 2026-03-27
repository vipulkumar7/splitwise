import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import BottomNav from "@/components/ui/BottomNav";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import Navbar from "@/components/shared/navbar";

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
          <div className="pb-20">{children}</div> {/* space for bottom nav */}
          <BottomNav />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}