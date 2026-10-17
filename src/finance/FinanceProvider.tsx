import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthProvider";
import type { Transaction, Budget, Goal, DraftTransaction } from "../lib/types";

type FinanceCtx = {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  loading: boolean;
  refresh: () => Promise<void>;
  saveTransaction: (draft: DraftTransaction) => Promise<string | null>;
  deleteTransaction: (id: string) => Promise<string | null>;
  saveBudget: (category: string, amount: number) => Promise<string | null>;
  saveGoal: (
    goal: Partial<Goal> & Pick<Goal, "name" | "target_amount">,
  ) => Promise<string | null>;
  updateGoal: (id: string, current_amount: number) => Promise<string | null>;
};
const Ctx = createContext<FinanceCtx | null>(null);
export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!session?.user.id) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      return;
    }
    setLoading(true);
    const [t, b, g] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false })
        .limit(1000),
      supabase.from("budgets").select("*").order("category"),
      supabase
        .from("savings_goals")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (!t.error) setTransactions((t.data || []) as Transaction[]);
    if (!b.error) setBudgets((b.data || []) as Budget[]);
    if (!g.error) setGoals((g.data || []) as Goal[]);
    setLoading(false);
  }, [session?.user.id]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const saveTransaction = async (d: DraftTransaction) => {
    if (!session?.user.id) return "Please sign in first.";
    const payload = {
      user_id: session.user.id,
      type: d.type || "expense",
      merchant: (d.merchant || "").trim() || "Unknown merchant",
      amount: Number(d.amount || 0),
      currency: "SGD",
      transaction_date:
        d.transaction_date || new Date().toISOString().slice(0, 10),
      category: d.category || "Unknown",
      notes: d.notes || null,
      gst_amount: Number(d.gst_amount || 0),
      includes_gst: Boolean(d.includes_gst),
      is_recurring: Boolean(d.is_recurring),
      recurring_frequency: d.is_recurring
        ? d.recurring_frequency || "monthly"
        : null,
    };
    if (payload.amount <= 0) return "Amount must be greater than zero.";
    const { error } = d.id
      ? await supabase.from("transactions").update(payload).eq("id", d.id)
      : await supabase.from("transactions").insert(payload);
    if (error) return error.message;
    await refresh();
    return null;
  };
  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return error.message;
    await refresh();
    return null;
  };
  const saveBudget = async (category: string, amount: number) => {
    if (!session?.user.id) return "Please sign in first.";
    if (amount <= 0) return "Budget must be greater than zero.";
    const month = new Date();
    const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
    const { error } = await supabase
      .from("budgets")
      .upsert(
        { user_id: session.user.id, category, amount, month: monthStr },
        { onConflict: "user_id,category,month" },
      );
    if (error) return error.message;
    await refresh();
    return null;
  };
  const saveGoal = async (
    goal: Partial<Goal> & Pick<Goal, "name" | "target_amount">,
  ) => {
    if (!session?.user.id) return "Please sign in first.";
    const payload = {
      user_id: session.user.id,
      name: goal.name.trim(),
      target_amount: Number(goal.target_amount),
      current_amount: Number(goal.current_amount || 0),
      target_date: goal.target_date || null,
    };
    if (!payload.name || payload.target_amount <= 0)
      return "Enter a goal name and a target above zero.";
    const { error } = goal.id
      ? await supabase.from("savings_goals").update(payload).eq("id", goal.id)
      : await supabase.from("savings_goals").insert(payload);
    if (error) return error.message;
    await refresh();
    return null;
  };
  const updateGoal = async (id: string, current_amount: number) => {
    const { error } = await supabase
      .from("savings_goals")
      .update({ current_amount })
      .eq("id", id);
    if (error) return error.message;
    await refresh();
    return null;
  };
  const value = useMemo(
    () => ({
      transactions,
      budgets,
      goals,
      loading,
      refresh,
      saveTransaction,
      deleteTransaction,
      saveBudget,
      saveGoal,
      updateGoal,
    }),
    [transactions, budgets, goals, loading, refresh],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useFinance() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useFinance must be inside FinanceProvider");
  return v;
}
