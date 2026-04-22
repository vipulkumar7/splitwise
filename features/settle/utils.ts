export const isValidUPI = (upi: string) => {
  const regex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
  if (!regex.test(upi)) return false;
  if (upi.includes("@gmail") || upi.includes("@yahoo")) return false;
  return true;
};

export const buildUPIParams = (upiId: string, amount: string) => {
  const txnRef = `TXN${Date.now()}`;

  return `pa=${upiId}&pn=${encodeURIComponent(
    "Friend",
  )}&am=${Number(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    "Split Payment",
  )}&tr=${txnRef}`;
};

export const getUPIUrl = (app: string, params: string) => {
  switch (app) {
    case "gpay":
      return `tez://upi/pay?${params}`;
    case "phonepe":
      return `phonepe://pay?${params}`;
    case "paytm":
      return `paytmmp://pay?${params}`;
    default:
      return `upi://pay?${params}`;
  }
};
