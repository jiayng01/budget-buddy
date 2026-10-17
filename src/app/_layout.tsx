import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FinanceProvider } from "../src/finance/FinanceProvider";
import { AuthProvider } from "../src/auth/AuthProvider";
import { COLORS } from "../src/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <StatusBar style="dark" backgroundColor={COLORS.bg} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="transaction/[id]" options={{ presentation: "modal" }} />
          <Stack.Screen name="auth" />
        </Stack>
      </FinanceProvider>
    </AuthProvider>
  );
}
