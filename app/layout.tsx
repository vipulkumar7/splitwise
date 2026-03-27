import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
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
          <Navbar />   {/* ✅ Added */}
          {children}
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}