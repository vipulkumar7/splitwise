import InstallPrompt from "@/components/pwa/InstallPrompt";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";

export const metadata = {
  title: "Splitwise",
  description: "Split expenses easily",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1",
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-black">
        <AuthProvider>
          {children}
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}