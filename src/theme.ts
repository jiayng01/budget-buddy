export const COLORS = {
  bg: "#F5F7F3", card: "#FFFFFF", ink: "#18231D", muted: "#718078",
  green: "#287653", greenLight: "#E2F2E8", line: "#E3E9E4",
  red: "#C45151", redLight: "#FCECEC", amber: "#B7771C", amberLight: "#FFF2D9",
  navy: "#253A32", pale: "#EDF2ED"
};
export const CATEGORIES = ["Food & Drink","Groceries","Transport","Shopping","Entertainment","Travel","Healthcare","Utilities","Education","Fees","Taxes","Subscriptions","Others","Unknown"];
export const TYPES = ["expense","income","transfer"] as const;
export type TransactionType = typeof TYPES[number];
