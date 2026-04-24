export default function SettleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<div className="min-h-[100dvh] text-white px-4 flex items-start justify-center md:items-center">      {children}
    </div>
  );
}
