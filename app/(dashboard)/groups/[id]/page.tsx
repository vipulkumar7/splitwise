import { IPageProps } from "@/types";
import GroupDetailClient from "@/features/groups/components/GroupDetailClient";

export default async function Page({ params }: IPageProps) {
  const { id } = await params;
  return <GroupDetailClient groupId={id} />;
}
