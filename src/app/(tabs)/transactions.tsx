import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useFinance } from "../../finance/FinanceProvider";
import { dateLabel, money } from "../../lib/format";
import { COLORS } from "../../theme";
import { Card, Empty, Field, Heading, Loading, Pill, Screen } from "../../ui";

export default function Transactions() {
  const { transactions, loading } = useFinance();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const list = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (filter === "all" || t.type === filter) &&
          `${t.merchant} ${t.category} ${t.notes || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [transactions, filter, query],
  );
  const totals = useMemo(() => {
    const result = { inflow: 0, outflow: 0 };

    for (const transaction of list) {
      if (transaction.type === "income") {
        result.inflow += Number(transaction.amount);
      } else if (transaction.type === "expense") {
        result.outflow += Number(transaction.amount);
      }
      // Transfers are deliberately excluded from both totals.
    }

    return {
      ...result,
      net: result.inflow - result.outflow,
    };
  }, [list]);
  return (
    <Screen>
      <Heading
        title="Transactions"
        subtitle={`${transactions.length} records`}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          {
            label: "Inflow",
            value: totals.inflow,
            background: COLORS.greenLight,
            foreground: COLORS.green,
          },
          {
            label: "Outflow",
            value: totals.outflow,
            background: COLORS.redLight,
            foreground: COLORS.red,
          },
          {
            label: "Net",
            value: totals.net,
            background: COLORS.ink,
            foreground: "#FFFFFF",
          },
        ].map((item) => (
          <View
            key={item.label}
            style={{
              flex: 1,
              minWidth: 0,
              gap: 6,
              padding: 10,
              backgroundColor: item.background,
              borderWidth: 2,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ fontSize: 11, color: item.foreground }}>
              {item.label}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: item.foreground,
              }}
            >
              {money(item.value)}
            </Text>
          </View>
        ))}
      </View>
      <Field
        label="Search"
        value={query}
        onChangeText={setQuery}
        placeholder="Merchant, category or notes"
      />
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {["all", "expense", "income", "transfer"].map((x) => (
          <Pill
            key={x}
            label={x === "all" ? "All" : x[0].toUpperCase() + x.slice(1)}
            active={filter === x}
            onPress={() => setFilter(x)}
          />
        ))}
      </View>
      <Card>
        {loading ? (
          <Loading />
        ) : list.length === 0 ? (
          <Empty
            title="No matching transactions"
            body="Try another search or add a transaction."
          />
        ) : (
          list.map((t) => (
            <Pressable
              key={t.id}
              onPress={() =>
                router.push({
                  pathname: "/transaction/[id]",
                  params: { id: t.id },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.line,
                gap: 12,
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{ fontSize: 15, fontWeight: "800", color: COLORS.ink }}
                >
                  {t.merchant}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.muted }}>
                  {t.category} · {dateLabel(t.transaction_date)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text
                  style={{
                    fontWeight: "800",
                    color: t.type === "income" ? COLORS.green : COLORS.ink,
                  }}
                >
                  {t.type === "income" ? "+" : t.type === "expense" ? "−" : ""}
                  {money(t.amount)}
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.muted }}>
                  {t.type}
                </Text>
              </View>
              <Ionicons name="chevron-forward" color={COLORS.muted} size={16} />
            </Pressable>
          ))
        )}
      </Card>
    </Screen>
  );
}
