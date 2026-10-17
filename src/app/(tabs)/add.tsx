import { useState } from "react";
import { Alert, Image, Pressable, Switch, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Screen, Heading, Card, Field, Button, Pill } from "../../ui";
import { COLORS, CATEGORIES, type TransactionType } from "../../theme";
import { useFinance } from "../../finance/FinanceProvider";
import { supabase } from "../../lib/supabase";

export default function AddTransaction() {
  const { saveTransaction } = useFinance();
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("expense");
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("Food & Drink");
  const [notes, setNotes] = useState("");
  const [gst, setGst] = useState(false);
  const [gstAmount, setGstAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const chooseReceipt = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to select a receipt.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.75,
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setImage(asset.uri);
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("parse-receipt", {
        body: {
          imageBase64: asset.base64,
          mimeType: asset.mimeType || "image/jpeg",
        },
      });
      if (error) throw error;
      const parsed = data?.transaction || data;
      if (parsed.merchant) setMerchant(String(parsed.merchant));
      if (parsed.amount !== undefined) setAmount(String(parsed.amount));
      if (parsed.date) setDate(String(parsed.date).slice(0, 10));
      if (parsed.category && CATEGORIES.includes(parsed.category))
        setCategory(parsed.category);
      if (parsed.gst_amount !== undefined) {
        setGst(true);
        setGstAmount(String(parsed.gst_amount));
      }
      Alert.alert(
        "Receipt parsed",
        "Review every extracted field before saving.",
      );
    } catch (e: any) {
      Alert.alert(
        "Could not parse receipt",
        e?.message ||
          "Check that the parse-receipt Edge Function is deployed. You can still enter the details manually.",
      );
    } finally {
      setBusy(false);
    }
  };
  const submit = async () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert("Check amount", "Enter an amount greater than zero.");
      return;
    }
    setBusy(true);
    const err = await saveTransaction({
      type,
      merchant,
      amount: Number(amount),
      transaction_date: date,
      category,
      notes,
      gst_amount: gst ? Number(gstAmount || 0) : 0,
      includes_gst: gst,
      is_recurring: recurring,
      recurring_frequency: frequency,
    });
    setBusy(false);
    if (err) Alert.alert("Could not save", err);
    else {
      Alert.alert("Saved", "Transaction added.");
      router.replace("/transactions");
    }
  };
  return (
    <Screen>
      <Heading
        title="Add transaction"
        subtitle="Record it now, refine details any time."
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {(["expense", "income", "transfer"] as TransactionType[]).map((x) => (
          <View key={x} style={{ flex: 1 }}>
            <Pill
              label={
                x === "income"
                  ? "Income / deposit"
                  : x[0].toUpperCase() + x.slice(1)
              }
              active={type === x}
              onPress={() => {
                setType(x);
                if (x === "income") setCategory("Income");
                else if (x === "transfer") setCategory("Others");
                else setCategory("Food & Drink");
              }}
            />
          </View>
        ))}
      </View>
      <Card>
        <Button
          title={busy ? "Processing…" : "Scan receipt photo"}
          secondary
          disabled={busy}
          onPress={chooseReceipt}
        />
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: 150, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : null}
        <Field
          label="Merchant / source"
          value={merchant}
          onChangeText={setMerchant}
          placeholder="e.g. FairPrice, Salary, PayNow"
        />
        <Field
          label="Amount (SGD)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        <Field
          label="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          placeholder="2026-10-17"
        />
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
        <Field
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add a note"
          multiline
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ fontWeight: "800", color: COLORS.ink }}>
              GST applies
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.muted }}>
              Default GST reference rate: 9%
            </Text>
          </View>
          <Switch
            value={gst}
            onValueChange={(v) => {
              setGst(v);
              if (v && !gstAmount && amount)
                setGstAmount(((Number(amount) * 9) / 109).toFixed(2));
            }}
            trackColor={{ true: COLORS.green }}
          />
        </View>
        {gst ? (
          <Field
            label="GST amount (SGD)"
            value={gstAmount}
            onChangeText={setGstAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontWeight: "800", color: COLORS.ink }}>
            Recurring transaction
          </Text>
          <Switch
            value={recurring}
            onValueChange={setRecurring}
            trackColor={{ true: COLORS.green }}
          />
        </View>
        {recurring ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["weekly", "monthly", "yearly"].map((f) => (
              <Pill
                key={f}
                label={f}
                active={frequency === f}
                onPress={() => setFrequency(f)}
              />
            ))}
          </View>
        ) : null}
        <Button
          title={busy ? "Saving…" : "Save transaction"}
          disabled={busy}
          onPress={submit}
        />
      </Card>
    </Screen>
  );
}
