
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

const GREEN = "#344238";
const GOLD = "#D4AF37";
const CREAM = "#F8FAF8";

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, maximum-scale=1"
  />
  <style>
    body {
      margin: 0;
      padding: 24px 16px;
      background: #F8FAF8;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: #344238;
      text-align: center;
    }

    h2 {
      font-size: 24px;
      margin-top: 28px;
    }

    p {
      color: #555;
      line-height: 1.6;
    }

    .voice-widget {
      margin-top: 48px;
      display: flex;
      justify-content: center;
    }
  </style>
</head>
<body>
  <h2>Talk to Parkour</h2>

  <p>
    Ask about UCF parking, garages, permits,
    and accessibility.
  </p>

  <div class="voice-widget">
    <elevenlabs-convai
      agent-id="agent_8701m4mamhgffjsa5nabxfxkampn">
    </elevenlabs-convai>
  </div>

  <script
    src="https://unpkg.com/@elevenlabs/convai-widget-embed"
    async
    type="text/javascript">
  </script>
</body>
</html>
`;

export default function VoiceAccessibilityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>â† Back</Text>
        </Pressable>

        <Text style={styles.title}>
          Parkour Voice Assistant
        </Text>

        <Text style={styles.subtitle}>
          Your hands-free UCF parking guide
        </Text>
      </View>

      <WebView
        originWhitelist={["*"]}
        source={{ uri: "https://elevenlabs.io/app/talk-to?agent_id=agent_8701m4mamhgffjsa5nabxfxkampn" }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={styles.webview}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Parking availability may change.
          Check official UCF information.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },

  backButton: {
    marginBottom: 18,
  },

  backText: {
    color: GOLD,
    fontSize: 16,
    fontWeight: "600",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    color: "#E6EAE6",
    fontSize: 14,
    marginTop: 6,
  },

  webview: {
    flex: 1,
    backgroundColor: CREAM,
  },

  footer: {
    padding: 14,
    backgroundColor: CREAM,
    borderTopWidth: 1,
    borderTopColor: "#E1E5E1",
  },

  footerText: {
    color: GREEN,
    fontSize: 12,
    textAlign: "center",
  },
});

