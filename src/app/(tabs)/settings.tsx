import { Alert, Text, View, Linking, Pressable } from "react-native";
import { Screen, Heading, Card, Button } from "../../ui";
import { COLORS } from "../../theme";
import { useAuth } from "../../auth/AuthProvider";
import { supabaseConfigured } from "../../lib/supabase";

export default function Settings() {
  const { session, signOut } = useAuth();
  return (
    <Screen>
      <Heading title="Settings" subtitle="Account and app preferences." />
      <Card>
        <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.ink }}>
          Account
        </Text>
        <Text style={{ color: COLORS.muted }}>
          {session?.user.email || "Not signed in"}
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>
          Database:{" "}
          {supabaseConfigured
            ? "Connected configuration detected"
            : "Not configured"}
        </Text>
        <Button
          title="Sign out"
          secondary
          onPress={() =>
            Alert.alert(
              "Sign out?",
              "You can sign in again to access your records.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Sign out",
                  style: "destructive",
                  onPress: () => void signOut(),
                },
              ],
            )
          }
        />
      </Card>
      <Card>
        <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.ink }}>
          Preferences
        </Text>
        <View style={{ gap: 7 }}>
          <Text style={{ color: COLORS.muted }}>Currency</Text>
          <Text style={{ fontWeight: "800", color: COLORS.ink }}>
            SGD · Singapore Dollar
          </Text>
        </View>
        <View style={{ gap: 7 }}>
          <Text style={{ color: COLORS.muted }}>
            Default GST reference rate
          </Text>
          <Text style={{ fontWeight: "800", color: COLORS.ink }}>
            9% (applied only when you enable GST)
          </Text>
        </View>
        <View style={{ gap: 7 }}>
          <Text style={{ color: COLORS.muted }}>Data policy</Text>
          <Text style={{ color: COLORS.ink, lineHeight: 21 }}>
            Transaction records are associated with your signed-in Supabase
            user. Receipt images are processed by the Edge Function and are not
            stored by this app after extraction.
          </Text>
        </View>
      </Card>
      <Card>
        <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.ink }}>
          Setup help
        </Text>
        <Text style={{ color: COLORS.muted, lineHeight: 21 }}>
          Use the README to configure Supabase tables and deploy the Gemini
          receipt parser. Keep API secrets on the server, never in the mobile
          bundle.
        </Text>
        <Pressable
          onPress={() => Linking.openURL("https://supabase.com/dashboard")}
        >
          <Text style={{ color: COLORS.green, fontWeight: "800" }}>
            Open Supabase Dashboard ↗
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
