import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Screen, Heading, Card, Stat, Pill, Empty } from "../../ui";
import { COLORS } from "../../theme";
import { useFinance } from "../../finance/FinanceProvider";
import { money } from "../../lib/format";

export default function Analytics() {
  const { transactions } = useFinance();
  const [range, setRange] = useState("6 months");
  const data = useMemo(() => {
    const now = new Date();
    const months = range === "3 months" ? 3 : range === "12 months" ? 12 : 6;
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(
        now.getFullYear(),
        now.getMonth() - (months - 1 - i),
        1,
      );
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const rows = transactions.filter(
        (t) => t.transaction_date.slice(0, 7) === key,
      );
      return {
        key,
        label: d.toLocaleDateString("en-SG", { month: "short" }),
        income: rows
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + t.amount, 0),
        expense: rows
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + t.amount, 0),
        rows,
      };
    });
  }, [transactions, range]);
  const current = data[data.length - 1];
  const previous = data[data.length - 2];
  const categories = useMemo(() => {
    const m = new Map<string, number>();
    current?.rows
      .filter((t) => t.type === "expense")
      .forEach((t) => m.set(t.category, (m.get(t.category) || 0) + t.amount));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [current]);
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  return (
    <Screen>
      <Heading title="Insights" subtitle="Understand where your money goes." />
      <View style={{ flexDirection: "row", gap: 7 }}>
        {["3 months", "6 months", "12 months"].map((x) => (
          <Pill
            key={x}
            label={x}
            active={range === x}
            onPress={() => setRange(x)}
          />
        ))}
      </View>
      <Card>
        <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
          Current month
        </Text>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <Stat
            label="Income"
            value={money(current?.income || 0)}
            color={COLORS.green}
          />
          <Stat
            label="Expenses"
            value={money(current?.expense || 0)}
            color={COLORS.red}
          />
        </View>
        <Text style={{ fontSize: 12, color: COLORS.muted }}>
          Net cash flow:{" "}
          {money((current?.income || 0) - (current?.expense || 0))}
        </Text>
        {previous ? (
          <Text style={{ fontSize: 12, color: COLORS.muted }}>
            Previous month expenses: {money(previous.expense)} · Change{" "}
            {previous.expense === 0
              ? "—"
              : `${(((current.expense - previous.expense) / previous.expense) * 100).toFixed(1)}%`}
          </Text>
        ) : null}
      </Card>
      <Card>
        <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
          Monthly trend
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.muted }}>
          Income and expenses · SGD
        </Text>
        {data.map((d) => (
          <View key={d.key} style={{ gap: 6, paddingVertical: 7 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontWeight: "700", color: COLORS.ink }}>
                {d.label} {d.key.slice(0, 4)}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.muted }}>
                −{money(d.expense)}
              </Text>
            </View>
            <View style={{ gap: 4 }}>
              <View
                style={{
                  height: 8,
                  width: `${(d.expense / max) * 100}%`,
                  backgroundColor: COLORS.red,
                  borderRadius: 20,
                  minWidth: d.expense ? 3 : 0,
                }}
              />
              <View
                style={{
                  height: 8,
                  width: `${(d.income / max) * 100}%`,
                  backgroundColor: COLORS.green,
                  borderRadius: 20,
                  minWidth: d.income ? 3 : 0,
                }}
              />
            </View>
          </View>
        ))}
      </Card>
      <Card>
        <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.ink }}>
          Category breakdown
        </Text>
        {categories.length === 0 ? (
          <Empty
            title="No expenses this month"
            body="Your category breakdown will appear once you record expenses."
          />
        ) : (
          categories.map(([cat, val]) => (
            <View key={cat} style={{ gap: 6, paddingVertical: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontWeight: "700", color: COLORS.ink }}>
                  {cat}
                </Text>
                <Text style={{ fontWeight: "800", color: COLORS.ink }}>
                  {money(val)}
                </Text>
              </View>
              <View
                style={{
                  height: 7,
                  backgroundColor: COLORS.pale,
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: 7,
                    width: `${(val / Math.max(1, categories[0][1])) * 100}%`,
                    backgroundColor: COLORS.green,
                  }}
                />
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}
