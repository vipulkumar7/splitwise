import InviteClient from "@/features/invite/InviteClient";

export default function Page({ params }: { params: { token: string } }) {
  return <InviteClient token={params.token} />;
}
