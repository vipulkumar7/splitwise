import { IGroup } from "@/types";

export const getTotalAmount = (group: IGroup) =>
  group.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

export const getMemberCount = (group: IGroup) => {
  if (group.members?.length > 0) return group.members.length;
  if ((group as any).isTemp) return 1;
  return 0;
};
