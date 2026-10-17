import type { TransactionType } from "../theme";
export type Transaction = {
  id: string; user_id: string; type: TransactionType; merchant: string; amount: number;
  currency: string; transaction_date: string; category: string; notes: string | null;
  gst_amount: number; includes_gst: boolean; is_recurring: boolean; recurring_frequency: string | null;
  created_at: string;
};
export type Budget = { id: string; user_id: string; category: string; amount: number; month: string; created_at: string };
export type Goal = { id: string; user_id: string; name: string; target_amount: number; current_amount: number; target_date: string | null; created_at: string };
export type DraftTransaction = Partial<Transaction> & { imageUri?: string };
