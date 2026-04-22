export interface IProfile {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export interface DetailRowProps {
  label: string;
  value?: string | null;
}
