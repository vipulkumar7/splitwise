import SettleClient from "@/features/settle/SettleClient";

export default async function Page({
  params,
}: {
  params: Promise<{ friendId: string }>;
}) {
  const { friendId } = await params;

  return <SettleClient friendId={friendId} />;
}
