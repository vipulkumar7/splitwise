export interface IUser {
  id: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null
}

export interface IGroupMember {
  user: IUser;
}
