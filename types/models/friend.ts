export interface IFriend {
  id: string;
  name: string;
  email?: string;
  balance: number; // +ve = you are owed, -ve = you owe
}

export interface IFriendsPageProps {
  friends: IFriend[];
}
