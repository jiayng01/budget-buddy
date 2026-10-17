export const money = (amount: number) =>
  new Intl.NumberFormat("en-SG", { style: "currency", currency: "SGD" }).format(
    Number.isFinite(amount) ? amount : 0,
  );
export const dateLabel = (value: string) => {
  const d = new Date(value + (value.length === 10 ? "T12:00:00" : ""));
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};
export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
export const currentMonth = () => new Date().toISOString().slice(0, 7);
