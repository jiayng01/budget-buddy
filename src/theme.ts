export const COLORS = {
  bg: "#F7F7F4",
  card: "#FFFFFF",
  ink: "#111111",
  muted: "#555555",

  // Semantic colours: keep green for positive financial values.
  green: "#267A4E",
  greenLight: "#E7F3EB",
  red: "#C43232",
  redLight: "#FCEBEA",
  amber: "#A16207",
  amberLight: "#FEF3C7",

  // Shared visual system inspired by the Lovable prototype.
  primary: "#111111",
  primaryLight: "#EFEFEB",
  border: "#111111",
  line: "#D5D5D0",
  navy: "#111111",
  pale: "#F0F0EC",
};

export const CATEGORIES = [
  "Food & Drink",
  "Groceries",
  "Transport",
  "Shopping",
  "Entertainment",
  "Travel",
  "Healthcare",
  "Utilities",
  "Education",
  "Fees",
  "Taxes",
  "Subscriptions",
  "Others",
  "Unknown",
];
export const TYPES = ["expense", "income", "transfer"] as const;
export type TransactionType = (typeof TYPES)[number];
