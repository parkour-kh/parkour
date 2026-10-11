import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useParkourTheme } from "@/contexts/parkour-theme";

// Web version of the Voice Assistant page. The phone version embeds the ElevenLabs page in a
// WebView, which doesn't exist in a browser, and ElevenLabs forbids being embedded in an
// iframe (X-Frame-Options: SAMEORIGIN). So on the web we open it in its own tab instead.
const ELEVENLABS_URL =
  "https://elevenlabs.io/app/talk-to?agent_id=agent_8701m4mamhgffjsa5nabxfxkampn";

export default function VoiceAccessibilityWeb() {
  const router = useRouter();
  const { isDark } = useParkourTheme();

  const c = isDark
    ? { bg: "#101827", header: "#182335", card: "#202B3C", border: "#354358", text: "#FFFFFF", muted: "#AAB4C4", button: "#D4AF37", buttonText: "#242424" }
    : { bg: "#F8FAF8", header: "#344238", card: "#FFFFFF", border: "#E1E5E1", text: "#242424", muted: "#77756F", button: "#344238", buttonText: "#FFFFFF" };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { backgroundColor: c.header }]}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Parkour Voice Assistant</Text>
        <Text style={styles.subtitle}>Your hands-free UCF parking guide</Text>
      </View>

      <View style={styles.body}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Talk to the assistant</Text>
          <Text style={[styles.cardText, { color: c.muted }]}>
            The voice assistant opens in its own tab. Allow microphone access when your browser
            asks, then just speak.
          </Text>

          <Pressable
            onPress={() => Linking.openURL(ELEVENLABS_URL)}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: c.button }]}
          >
            <Text style={[styles.buttonText, { color: c.buttonText }]}>Open voice assistant</Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, { color: c.muted }]}>
          Parking availability may change. Check official UCF information.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22 },
  back: { color: "#D4AF37", fontWeight: "700", fontSize: 16, marginBottom: 14 },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#E6EAE6", fontSize: 14, marginTop: 4 },
  body: { padding: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 20 },
  cardTitle: { fontSize: 20, fontWeight: "800" },
  cardText: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  button: { marginTop: 18, borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  buttonText: { fontWeight: "800", fontSize: 15 },
  footer: { fontSize: 12, textAlign: "center", marginTop: 24 },
});
