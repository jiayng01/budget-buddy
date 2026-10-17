import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme";
import { useAuth } from "../../auth/AuthProvider";
import { Redirect } from "expo-router";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "grid-outline",
  transactions: "receipt-outline",
  add: "add-circle",
  budgets: "wallet-outline",
  analytics: "stats-chart-outline",
  settings: "settings-outline",
};
export default function TabsLayout() {
  const { session, configured, loading } = useAuth();
  if (!loading && (!configured || !session)) return <Redirect href="/auth" />;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: "#FFFFFF",
          borderTopColor: COLORS.line,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={icons[route.name] || "ellipse-outline"}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Overview" }} />
      <Tabs.Screen name="transactions" options={{ title: "History" }} />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarLabel: "Add",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="budgets" options={{ title: "Budgets" }} />
      <Tabs.Screen name="analytics" options={{ title: "Insights" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
