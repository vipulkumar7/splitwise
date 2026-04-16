export type IMember = {
  userId: string;
};

export type ISplit = {
  userId: string;
  expenseId: string;
  amount: number;
};

export type ISplitsInput = Record<string, number | string>;
