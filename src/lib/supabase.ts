import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY || "";
export const supabaseConfigured = Boolean(
  url && key && !url.includes("YOUR_PROJECT"),
);
export const supabase = createClient(
  supabaseConfigured ? url : "https://placeholder.supabase.co",
  supabaseConfigured ? key : "placeholder-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
