import { IExpense } from "./expense";
import { IGroupMember } from "./user";

export interface IBalanceList {
  members: IGroupMember[];
  expenses: IExpense[];
  currentUserId?: string;
  getName: (id: string) => string;
}