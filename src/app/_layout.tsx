import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../auth/AuthProvider";
import { FinanceProvider } from "../finance/FinanceProvider";
import { COLORS } from "../theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="transaction/[id]"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="auth" />
        </Stack>
      </FinanceProvider>
    </AuthProvider>
  );
}
