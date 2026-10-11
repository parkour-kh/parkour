
import React, { useEffect, useState } from "react";
import * as Speech from "expo-speech";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";

const SAMPLE =
  "Welcome to Parkour. Choose your destination, check the parking rules for your permit, and park safely. For assistance, visit UCF Parking and Transportation Services.";

export default function VoiceAccessibility() {
  const router = useRouter();

  const [text, setText] = useState(SAMPLE);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  async function speakText() {
    if (!text.trim()) return;

    try {
      await Speech.stop();

      setSpeaking(true);

      Speech.speak(text.trim(), {
        language: "en-US",
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => {
          setSpeaking(false);
          Alert.alert(
            "Voice unavailable",
            "Unable to play speech on this device."
          );
        },
      });
    } catch (error) {
      console.error("Voice error:", error);
      setSpeaking(false);
      Alert.alert(
        "Voice unavailable",
        "Please try again."
      );
    }
  }

  async function stopSpeaking() {
    try {
      await Speech.stop();
      setSpeaking(false);
    } catch (error) {
      console.error("Stop speech error:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => router.replace("/")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>
            ← Parkour
          </Text>
        </Pressable>

        <Text style={styles.heading}>
          Voice accessibility
        </Text>

        <Text style={styles.subtitle}>
          Hear parking information spoken aloud.
          All information remains available on screen.
        </Text>

        <Text style={styles.label}>
          Text to speak
        </Text>

        <TextInput
          multiline
          accessibilityLabel="Text for voice assistance"
          value={text}
          onChangeText={setText}
          maxLength={1500}
          style={styles.input}
          textAlignVertical="top"
        />

        <Pressable
          accessibilityRole="button"
          disabled={!text.trim()}
          onPress={speakText}
          style={[
            styles.button,
            !text.trim() && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {speaking
              ? "Restart parking information"
              : "Speak parking information"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!speaking}
          onPress={stopSpeaking}
          style={[
            styles.button,
            !speaking && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>
            Stop audio
          </Text>
        </Pressable>

        <Text style={styles.note}>
          Use this feature while parked, not while
          driving. Speech is generated using your
          device's voice system.
        </Text>

        <Pressable
          onPress={() =>
            Linking.openURL("https://parking.ucf.edu/")
          }
        >
          <Text style={styles.link}>
            Official UCF parking information ↗
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/")}
        >
          <Text style={styles.back}>
            Return to Parkour home
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },

  content: {
    padding: 24,
    paddingTop: 36,
    paddingBottom: 64,
  },

  backButton: {
    marginBottom: 30,
  },

  backButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#344238",
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#344238",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: "#55534F",
    marginBottom: 28,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344238",
    marginBottom: 10,
  },

  input: {
    minHeight: 160,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D4C3",
    fontSize: 16,
    lineHeight: 24,
    color: "#242424",
  },

  button: {
    backgroundColor: "#D4AF37",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
    minHeight: 58,
    justifyContent: "center",
  },

  disabled: {
    opacity: 0.45,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#242424",
  },

  note: {
    fontSize: 14,
    lineHeight: 22,
    color: "#77756F",
    marginTop: 28,
    marginBottom: 24,
  },

  link: {
    fontSize: 16,
    color: "#344238",
    textDecorationLine: "underline",
    marginBottom: 24,
  },

  back: {
    fontSize: 16,
    color: "#344238",
    fontWeight: "600",
  },
});
