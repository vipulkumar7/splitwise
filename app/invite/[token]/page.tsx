import InviteClient from "@/features/invite/InviteClient";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InviteClient token={token} />;
}
