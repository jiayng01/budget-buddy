import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../../auth/AuthProvider";
import { COLORS } from "../../theme";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  transactions: "receipt-outline",
  budgets: "wallet-outline",
  analytics: "stats-chart-outline",
  settings: "settings-outline",
};

export default function TabsLayout() {
  const { session, configured, loading } = useAuth();

  if (!loading && (!configured || !session)) {
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.ink,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          height: 70,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: COLORS.card,
          borderTopWidth: 2,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, size }) =>
          route.name === "add" ? (
            <View
              style={{
                width: 44,
                height: 44,
                marginTop: -14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: COLORS.ink,
                borderWidth: 2,
                borderColor: COLORS.border,
                shadowColor: "#000000",
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 3,
              }}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </View>
          ) : (
            <Ionicons
              name={icons[route.name] || "ellipse-outline"}
              size={size}
              color={color}
            />
          ),
      })}
    >
      {/* Keep the old entry route, but do not show it as a tab. */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="transactions"
        options={{ title: "Transactions" }}
      />
      <Tabs.Screen name="budgets" options={{ title: "Goals" }} />
      <Tabs.Screen name="add" options={{ title: "Add" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}