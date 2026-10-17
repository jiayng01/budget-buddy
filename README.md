# Budget Buddy (Expo SDK 57)

A mobile-first personal finance tracker built with Expo Router, React Native, and Supabase. Currency is SGD by default. This repository intentionally contains no sample transactions or seeded financial data.

## Features included in this foundation
- Expo Router tab navigation: Overview, Transactions, Add, Budgets, Analytics, Settings.
- Add expenses, income/deposits, and transfers; edit merchant, date, amount, category, notes, and GST.
- Receipt photo selection and secure server-side Gemini extraction through a Supabase Edge Function.
- Supabase email/password authentication and per-user transaction, budget, and savings-goal data.
- Overview totals, monthly transaction history, category filters, budget progress, savings goals, and six-month spending trend.
- GST toggle defaults to 9%; it does not assume every transaction is GST-applicable.
- No dummy transaction records are generated.

## Requirements
- Node.js LTS
- Expo Go that supports SDK 57
- A Supabase project for persistent accounts/data and receipt parsing

## Setup
1. Install dependencies: `npm install`
2. Align Expo module versions to SDK 57: `npx expo install --fix` (then run `npx expo-doctor`).
3. Copy `.env.example` to `.env`, then fill in the Supabase URL and anon/publishable key.
4. In Supabase SQL Editor, run `supabase/migrations/0001_initial.sql`.
5. Deploy the `parse-receipt` Edge Function and set its `GEMINI_API_KEY` secret. See `supabase/functions/parse-receipt/README.md`.
6. Run `npx expo start` and scan the QR code with Expo Go.

Without Supabase configuration, the app shows a setup/auth screen instead of inventing local financial records.

## Important notes
- Never put `GEMINI_API_KEY` in `.env` variables prefixed with `EXPO_PUBLIC_` or in the mobile app. It belongs only in Supabase Edge Function secrets.
- Receipt extraction is a draft: review and edit all AI-prefilled fields before saving.
- Transfers are stored as a distinct transaction type and excluded from income/expense totals.
- Recurring transaction scheduling and push notifications are not yet automated; recurrence metadata can be saved but requires a scheduled backend job for automatic generation.
- Test on a throwaway Supabase project before adding real financial data.
