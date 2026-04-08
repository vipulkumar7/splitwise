// lib/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Something went wrong");
  }

  return res.json();
};
