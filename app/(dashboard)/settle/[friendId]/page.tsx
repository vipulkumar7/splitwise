import SettleClient from "@/features/settle/SettleClient";

export default function Page({ params }: any) {
  const friendId = params?.friendId as string;

  return <SettleClient friendId={friendId} />;
}
