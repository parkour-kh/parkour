
import React from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { useParkourTheme } from "@/contexts/parkour-theme";

const ELEVENLABS_URL =
  "https://elevenlabs.io/app/talk-to?agent_id=agent_8701m4mamhgffjsa5nabxfxkampn";

const LIGHT_COLORS = {
  background: "#F8FAF8",
  header: "#344238",
  heading: "#FFFFFF",
  subtitle: "#E6EAE6",
  gold: "#D4AF37",
  footerText: "#344238",
  border: "#E1E5E1",
};

const DARK_COLORS = {
  background: "#101827",
  header: "#182335",
  heading: "#FFFFFF",
  subtitle: "#AAB4C4",
  gold: "#D4AF37",
  footerText: "#D1D9E6",
  border: "#354358",
};

export default function VoiceAccessibilityScreen() {
  const router = useRouter();
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          Parkour Voice Assistant
        </Text>

        <Text style={styles.subtitle}>
          Your hands-free UCF parking guide
        </Text>
      </View>

      {/* ELEVENLABS VOICE ASSISTANT */}
      <WebView
        originWhitelist={["*"]}
        source={{ uri: ELEVENLABS_URL }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Parking availability may change.
          Check official UCF information.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function createStyles(COLORS: typeof LIGHT_COLORS) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    header: {
      backgroundColor: COLORS.header,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 24,
    },

    backButton: {
      marginBottom: 18,
      alignSelf: "flex-start",
    },

    backText: {
      color: COLORS.gold,
      fontSize: 16,
      fontWeight: "600",
    },

    title: {
      color: COLORS.heading,
      fontSize: 25,
      fontWeight: "800",
    },

    subtitle: {
      color: COLORS.subtitle,
      fontSize: 14,
      marginTop: 6,
    },

    webviewContainer: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    webview: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    footer: {
      padding: 14,
      backgroundColor: COLORS.background,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
    },

    footerText: {
      color: COLORS.footerText,
      fontSize: 12,
      textAlign: "center",
    },
  });
}
