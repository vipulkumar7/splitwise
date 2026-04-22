export interface IFriend {
  id: string | null;
  name: string;
  email: string;
  balance: number;
  image?: string | null;
}

export interface IFriendsPageProps {
  friends: IFriend[];
}

export interface ISummaryCardProps {
  label: string;
  value: number;
  type: "owe" | "owed" | "net";
}

export interface ISettlement {
  id: string;
  createdAt: Date;
  amount: number;
  fromUserId: string;
  toUserId: string;
}
