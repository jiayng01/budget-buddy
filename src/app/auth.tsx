import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../auth/AuthProvider";
import { Button, Field, Screen, Card } from "../ui";
import { COLORS } from "../theme";

export default function AuthScreen() {
  const { signIn, signUp, configured, session } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  if (session) { router.replace("/(tabs)"); }
  return <Screen scroll={false}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "center" }}>
      <View style={{ paddingHorizontal: 24, gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ color: COLORS.green, fontSize: 14, fontWeight: "800", letterSpacing: 1.5 }}>BUDGET BUDDY</Text>
          <Text style={{ color: COLORS.ink, fontSize: 32, fontWeight: "800" }}>Your money,{"\n"}in clearer view.</Text>
          <Text style={{ color: COLORS.muted, fontSize: 15, lineHeight: 22 }}>Track spending, income and savings in one place.</Text>
        </View>
        <Card>
          {!configured ? <>
            <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>Connect Supabase</Text>
            <Text style={{ color: COLORS.muted, lineHeight: 21 }}>Create a .env file from .env.example and add your Supabase URL and anon key, then restart Expo.</Text>
          </> : <>
            <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.ink }}>{creating ? "Create your account" : "Welcome back"}</Text>
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
            <Button title={busy ? "Please wait…" : creating ? "Create account" : "Sign in"} disabled={busy} onPress={async () => {
              setBusy(true);
              const result = creating ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
              setBusy(false);
              if (result.error) Alert.alert("Authentication failed", result.error);
              else if (creating && !result.session) Alert.alert("Check your email", "Confirm your email address, then sign in.");
              else router.replace("/(tabs)");
            }} />
            <Pressable onPress={() => setCreating(!creating)}><Text style={{ textAlign: "center", color: COLORS.green, fontWeight: "700", padding: 8 }}>{creating ? "Already registered? Sign in" : "New here? Create an account"}</Text></Pressable>
          </>}
        </Card>
        <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: "center" }}>Your financial records are private to your account.</Text>
      </View>
    </KeyboardAvoidingView>
  </Screen>;
}
