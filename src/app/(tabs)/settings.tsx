
import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useParkourTheme } from "@/contexts/parkour-theme";

export default function SettingsScreen() {
const { appearance, setAppearance, isDark } = useParkourTheme();

  const background = isDark ? "#101827" : "#F5F7FA";
  const card = isDark ? "#1D2939" : "#FFFFFF";
  const text = isDark ? "#FFFFFF" : "#172033";
  const secondary = isDark ? "#AAB4C4" : "#667085";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: secondary }]}>
        Make Parkour work better for you.
      </Text>

      
<View style={[styles.card, { backgroundColor: card }]}>
  <Text style={[styles.heading, { color: text }]}>
    Appearance
  </Text>

  <Text style={{ color: secondary }}>
    Choose how Parkour looks.
  </Text>

  <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
    {(["light", "dark"] as const).map((mode) => (
      <Pressable
        key={mode}
        onPress={() => setAppearance(mode)}
        accessibilityRole="button"
        accessibilityState={{ selected: appearance === mode }}
        style={{
          flex: 1,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          backgroundColor:
            appearance === mode
              ? "#E5B933"
              : isDark
                ? "#344054"
                : "#F2F4F7",
        }}
      >
        <Text
          style={{
            color: appearance === mode ? "#171717" : text,
            fontWeight: "600",
          }}
        >
          {mode === "light" ? "Light Mode" : "Dark Mode"}
        </Text>
      </Pressable>
    ))}
  </View>
</View>


      <View style={[styles.card, { backgroundColor: card }]}>
        <Text style={[styles.heading, { color: text }]}>
          Accessibility
        </Text>
        <Text style={{ color: secondary }}>
          Accessibility preferences coming soon.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: card }]}>
        <Text style={[styles.heading, { color: text }]}>
          About Parkour
        </Text>
        <Text style={{ color: secondary }}>
          Smarter parking, less searching.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 22,
    paddingTop: 35,
    paddingBottom: 48,
    gap: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  card: {
    padding: 20,
    borderRadius: 18,
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
});
