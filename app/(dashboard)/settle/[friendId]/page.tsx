import SettleClient from "@/features/settle/SettleClient";

export default function Page({ params }: { params: { friendId: string } }) {
  return <SettleClient friendId={params.friendId} />;
}
