
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useParkourTheme } from "@/contexts/parkour-theme";

const LIGHT_COLORS = {
  background: "#F8FAF8",
  text: "#242424",
  muted: "#77756F",
  gold: "#D4AF37",
  card: "#F3F6F3",
  green: "#344238",
  white: "#FFFFFF",
  border: "#E1E7E1",
  red: "#C62828",
  iconBackground: "#F0EBE2",
  description: "#55534F",
  goldText: "#242424",
};

const DARK_COLORS = {
  background: "#101827",
  text: "#FFFFFF",
  muted: "#AAB4C4",
  gold: "#D4AF37",
  card: "#202B3C",
  green: "#D4AF37",
  white: "#FFFFFF",
  border: "#354358",
  red: "#C62828",
  iconBackground: "#354358",
  description: "#E4E7EC",
  goldText: "#242424",
};

export default function NeedAssistance() {
  const router = useRouter();
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const callEmergency = () => {
    Alert.alert(
      "Emergency Assistance",
      "This will open your phone's emergency dialer. Only proceed if you need emergency services.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Dialer",
          onPress: async () => {
            try {
              await Linking.openURL("tel:911");
            } catch {
              Alert.alert(
                "Unable to Open Dialer",
                "Please use your phone's built-in emergency calling feature."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.text}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* HEADER */}
        <Text style={styles.heading}>Need Assistance?</Text>

        <Text style={styles.subtitle}>
          We're here to help you navigate parking safely
          and confidently.
        </Text>

        {/* EMERGENCY ASSISTANCE */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="call-outline"
              size={26}
              color={COLORS.red}
            />
          </View>

          <Text style={styles.cardTitle}>
            Emergency Assistance
          </Text>

          <Text style={styles.description}>
            Need immediate help? Access your phone's
            emergency dialer.
          </Text>

          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={callEmergency}
            accessibilityRole="button"
            accessibilityLabel="Open emergency dialer for 911"
          >
            <Ionicons
              name="call"
              size={18}
              color={COLORS.white}
            />
            <Text style={styles.emergencyButtonText}>
              Call 911
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            You can also use your phone's built-in
            Emergency SOS shortcut using its physical buttons.
          </Text>
        </View>

        {/* GEMINI ASSISTANT */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="chatbubbles-outline"
              size={27}
              color={COLORS.green}
            />
          </View>

          <Text style={styles.cardTitle}>
            Gemini AI Assistant
          </Text>

          <Text style={styles.description}>
            Ask questions about UCF parking, garages,
            directions, permits, and accessibility.
          </Text>

          <TouchableOpacity
            style={styles.goldButton}
            onPress={() => router.push("/ai-chat")}
            accessibilityRole="button"
            accessibilityLabel="Open Gemini AI Chat"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={19}
              color={COLORS.goldText}
            />

            <Text style={styles.goldButtonText}>
              Open AI Chat
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.goldText}
            />
          </TouchableOpacity>
        </View>

        {/* ELEVENLABS VOICE ASSISTANCE */}
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="volume-high-outline"
              size={27}
              color={COLORS.green}
            />
          </View>

          <Text style={styles.cardTitle}>
            Voice Assistance
          </Text>

          <Text style={styles.description}>
            Listen to parking information using ElevenLabs
            voice technology. No account required.
          </Text>

          <TouchableOpacity
            style={styles.goldButton}
            onPress={() => router.push("/voice-accessibility")}
            accessibilityRole="button"
            accessibilityLabel="Start ElevenLabs Voice Assistance"
          >
            <Ionicons
              name="mic-outline"
              size={20}
              color={COLORS.goldText}
            />

            <Text style={styles.goldButtonText}>
              Start Voice Assistance
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.goldText}
            />
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color={COLORS.muted}
          />

          <Text style={styles.footerText}>
            Parkour is designed to make campus parking
            easier and more accessible for everyone.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(COLORS: typeof LIGHT_COLORS) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    content: {
      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 45,
    },

    back: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 25,
    },

    backText: {
      color: COLORS.text,
      fontSize: 15,
      fontWeight: "500",
    },

    heading: {
      color: COLORS.text,
      fontSize: 29,
      fontWeight: "800",
      marginBottom: 9,
    },

    subtitle: {
      color: COLORS.muted,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 26,
    },

    card: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      padding: 21,
      marginBottom: 17,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    iconCircle: {
      width: 49,
      height: 49,
      borderRadius: 14,
      backgroundColor: COLORS.iconBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    cardTitle: {
      color: COLORS.text,
      fontSize: 19,
      fontWeight: "700",
      marginTop: 14,
      marginBottom: 9,
    },

    description: {
      color: COLORS.description,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 19,
    },

    emergencyButton: {
      backgroundColor: COLORS.red,
      borderRadius: 12,
      minHeight: 49,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    emergencyButtonText: {
      color: COLORS.white,
      fontWeight: "700",
      fontSize: 15,
    },

    goldButton: {
      backgroundColor: COLORS.gold,
      borderRadius: 12,
      minHeight: 49,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    goldButtonText: {
      color: COLORS.goldText,
      fontWeight: "700",
      fontSize: 14,
      flexShrink: 1,
    },

    note: {
      color: COLORS.muted,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 13,
    },

    footer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 9,
      paddingHorizontal: 5,
      marginTop: 7,
    },

    footerText: {
      flex: 1,
      color: COLORS.muted,
      fontSize: 12,
      lineHeight: 19,
    },
  });
}
