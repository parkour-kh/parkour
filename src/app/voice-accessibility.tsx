import React, { useState } from "react";
import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as Speech from "expo-speech";

const API_BASE = "https://parkour-api.onrender.com";
const MESSAGE = "Welcome to Parkour. Check your permit, choose a destination, and follow UCF parking regulations.";

export default function VoiceAccessibility() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [spoken, setSpoken] = useState(false);

  async function speak() {
    if (busy) return;
    setBusy(true);
    try {
      // Use device speech as an accessible fallback while server audio is being configured.
      await Speech.stop();
      Speech.speak(MESSAGE, { language: "en-US", onDone: () => setBusy(false), onError: () => setBusy(false) });
      setSpoken(true);
    } catch (error) {
      setBusy(false);
      Alert.alert("Speech unavailable", "Your device could not start speech playback.");
    }
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>‹ Back to Parkour</Text>
        </Pressable>
        <Text style={styles.eyebrow}>PARKOUR / ACCESSIBILITY</Text>
        <Text style={styles.title}>Parking info, spoken clearly.</Text>
        <Text style={styles.subtitle}>Listen to important parking guidance without losing the written information.</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PARKING GUIDANCE</Text>
          <Text style={styles.message}>{MESSAGE}</Text>
        </View>
        <Pressable onPress={speak} style={styles.primary} accessibilityRole="button">
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{spoken ? "Speak again" : "Speak parking information"}</Text>}
        </Pressable>
        <Pressable onPress={() => { Speech.stop(); setBusy(false); }} style={styles.secondary} accessibilityRole="button">
          <Text style={styles.secondaryText}>Stop speaking</Text>
        </Pressable>
        <Text style={styles.note}>Use this feature while parked, not while driving. Device speech is available while ElevenLabs server playback is being configured.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAF8" },
  content: { padding: 25, paddingTop: 65, paddingBottom: 70 },
  back: { fontSize: 16, color: "#344238", fontWeight: "700", marginBottom: 48 },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 2, color: "#B58E1F", marginBottom: 12 },
  title: { fontSize: 38, lineHeight: 44, fontWeight: "800", color: "#344238", marginBottom: 16 },
  subtitle: { fontSize: 17, lineHeight: 26, color: "#77756F", marginBottom: 34 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 25, borderWidth: 1, borderColor: "#E5E9E4", marginBottom: 26 },
  cardLabel: { fontSize: 11, letterSpacing: 1.5, fontWeight: "800", color: "#B58E1F", marginBottom: 15 },
  message: { fontSize: 19, lineHeight: 30, color: "#344238" },
  primary: { backgroundColor: "#344238", borderRadius: 17, minHeight: 62, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  primaryText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  secondary: { borderRadius: 17, minHeight: 58, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#DCE4DB" },
  secondaryText: { color: "#344238", fontSize: 16, fontWeight: "700" },
  note: { color: "#77756F", fontSize: 13, lineHeight: 21, marginTop: 30 },
});
