import React, { useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useRouter } from "expo-router";

const API_BASE = "https://parkour-api.onrender.com";
const SAMPLE = "Welcome to Parkour. Choose your destination, check the parking rules for your permit, and park safely. For assistance, visit UCF Parking and Transportation Services.";

export default function VoiceAccessibility() {
  const router = useRouter();
  const [text, setText] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);

  async function requestVoice() {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`${API_BASE}/api/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim().slice(0, 1500) }),
      });
      if (!response.ok) {
        Alert.alert("Voice unavailable", "The ElevenLabs service is not connected to Render yet. Your text remains available on screen.");
        return;
      }
      // A playable audio client will be added after the Render endpoint is deployed.
      Alert.alert("Voice generated", "The server returned audio successfully. Audio playback is not connected in this preview yet.");
    } catch {
      Alert.alert("Connection issue", "Could not reach the voice service. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Voice Accessibility", headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Voice accessibility</Text>
        <Text style={styles.subtitle}>A work-in-progress accessibility feature powered by ElevenLabs. Parking information remains readable without audio.</Text>
        <Text style={styles.label}>Text to speak</Text>
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
          accessibilityLabel="Generate spoken parking information"
          accessibilityState={{ disabled: busy }}
          disabled={busy}
          onPress={requestVoice}
          style={styles.button}
        >
          {busy ? <ActivityIndicator color="#242424" /> : <Text style={styles.buttonText}>Generate voice preview</Text>}
        </Pressable>
        <Text style={styles.note}>Audio playback will be enabled after the Render backend and mobile player are connected. Use this feature while parked, not while driving.</Text>
        <Pressable onPress={() => Linking.openURL("https://parking.ucf.edu/")} accessibilityRole="link">
          <Text style={styles.link}>Official UCF parking information ↗</Text>
        </Pressable>
        <Pressable onPress={() => router.replace("/")} accessibilityRole="button">
          <Text style={styles.back}>Return to Parkour home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAF8" },
  content: { padding: 24, paddingTop: 36, paddingBottom: 64 },
  heading: { fontSize: 28, fontWeight: "800", color: "#242424", marginBottom: 12 },
  subtitle: { fontSize: 16, lineHeight: 24, color: "#55534F", marginBottom: 28 },
  label: { fontSize: 16, fontWeight: "700", color: "#242424", marginBottom: 10 },
  input: { minHeight: 160, padding: 16, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#D9D4C3", fontSize: 16, lineHeight: 24, color: "#242424" },
  button: { backgroundColor: "#D4AF37", padding: 18, borderRadius: 14, alignItems: "center", marginTop: 18, marginBottom: 18 },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#242424" },
  note: { fontSize: 14, lineHeight: 22, color: "#77756F", marginBottom: 24 },
  link: { fontSize: 16, color: "#344238", textDecorationLine: "underline", marginBottom: 24 },
  back: { fontSize: 16, color: "#344238", fontWeight: "600" },
});
