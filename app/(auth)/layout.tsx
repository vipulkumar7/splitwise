export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center h-[100dvh] overflow-hidden px-4 bg-zinc-950">
      {children}
    </div>
  );
}
