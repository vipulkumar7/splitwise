import InviteClient from "@/features/invite/InviteClient";

export default function Page({ params }: any) {
  return <InviteClient token={params.token} />;
}
