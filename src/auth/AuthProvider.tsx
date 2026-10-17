import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../lib/supabase";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; session: Session | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; session: Session | null }>;
  signOut: () => Promise<void>;
};
const Ctx = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message || null, session: data.session };
  };
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message || null, session: data.session };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };
  return (
    <Ctx.Provider
      value={{
        session,
        loading,
        configured: supabaseConfigured,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export function useAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAuth must be inside AuthProvider");
  return value;
}
