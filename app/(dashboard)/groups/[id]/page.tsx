import { IPageProps } from "@/types";
import GroupDetailClient from "./GroupDetailClient";

export default async function Page({ params }: IPageProps) {
  const { id } = await params;
  return <GroupDetailClient groupId={id} />;
}
