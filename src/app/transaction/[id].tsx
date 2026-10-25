import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { useFinance } from "../../finance/FinanceProvider";
import { dateLabel, money } from "../../lib/format";
import { CATEGORIES, COLORS } from "../../theme";
import { Button, Card, Field, Heading, Pill, Screen } from "../../ui";

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, saveTransaction, deleteTransaction } = useFinance();
  const router = useRouter();
  const t = transactions.find((x) => x.id === id);
  const [merchant, setMerchant] = useState(t?.merchant || "");
  const [amount, setAmount] = useState(String(t?.amount ?? ""));
  const [date, setDate] = useState(t?.transaction_date || "");
  const [category, setCategory] = useState(t?.category || "Others");
  const [notes, setNotes] = useState(t?.notes || "");
  const [busy, setBusy] = useState(false);
  if (!t)
    return (
      <Screen>
        <Heading title="Transaction not found" />
        <Text style={{ color: COLORS.muted }}>
          This record may have been deleted.
        </Text>
        <Button title="Back to transactions" onPress={() => router.back()} />
      </Screen>
    );
  return (
    <Screen>
      <Heading
        title="Transaction details"
        subtitle={`${t.type.toUpperCase()} · ${dateLabel(t.transaction_date)}`}
      />
      <Card>
        <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.ink }}>
          {money(t.amount)}
        </Text>
        <Field
          label="Merchant / source"
          value={merchant}
          onChangeText={setMerchant}
        />
        <Field
          label="Amount (SGD)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
        <Text style={{ fontSize: 12, fontWeight: "800", color: COLORS.muted }}>
          CATEGORY
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
          {CATEGORIES.map((c) => (
            <Pill
              key={c}
              label={c}
              active={category === c}
              onPress={() => setCategory(c)}
            />
          ))}
        </View>
        <Field label="Notes" value={notes} onChangeText={setNotes} multiline />
        <Button
          title={busy ? "Saving…" : "Save changes"}
          disabled={busy}
          onPress={async () => {
            setBusy(true);
            const e = await saveTransaction({
              ...t,
              merchant,
              amount: Number(amount),
              transaction_date: date,
              category,
              notes,
            });
            setBusy(false);
            if (e) Alert.alert("Could not save", e);
            else router.back();
          }}
        />
        <Button
          title="Delete transaction"
          secondary
          onPress={() =>
            Alert.alert("Delete transaction?", "This cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  const e = await deleteTransaction(t.id);
                  if (e) Alert.alert("Could not delete", e);
                  else router.back();
                },
              },
            ])
          }
        />
      </Card>
    </Screen>
  );
}
