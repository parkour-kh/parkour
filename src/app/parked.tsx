
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useParkourTheme } from "@/contexts/parkour-theme";

const LIGHT_COLORS = {
  background: "#F8FAF8",
  text: "#344238",
  gold: "#D4AF37",
  card: "#FFFFFF",
  muted: "#77756F",
  border: "#E1E7E1",
  input: "#FFFFFF",
  placeholder: "#999999",
  button: "#344238",
  buttonText: "#FFFFFF",
  success: "#344238",
};

const DARK_COLORS = {
  background: "#101827",
  text: "#FFFFFF",
  gold: "#D4AF37",
  card: "#202B3C",
  muted: "#AAB4C4",
  border: "#354358",
  input: "#182335",
  placeholder: "#8995A7",
  button: "#D4AF37",
  buttonText: "#242424",
  success: "#E0C46E",
};

export default function ParkedScreen() {
  const router = useRouter();
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const [garage, setGarage] = useState("");
  const [spot, setSpot] = useState("");
  const [saved, setSaved] = useState(false);

  function saveParking() {
    if (!garage.trim()) {
      Alert.alert(
        "Missing garage",
        "Please enter where you parked."
      );
      return;
    }

    setSaved(true);
    Alert.alert("Saved!", "Your parking location is saved.");
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Already parked?</Text>

        <Text style={styles.subtitle}>
          Remember where you left your car.
        </Text>

        <View style={styles.card}>
          <Ionicons
            name="car-outline"
            size={36}
            color={COLORS.gold}
          />

          <Text style={styles.heading}>
            Your parking location
          </Text>

          <Text style={styles.label}>
            Garage or lot
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Garage H"
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.gold}
            value={garage}
            onChangeText={setGarage}
            editable={!saved}
            accessibilityLabel="Garage or lot"
          />

          <Text style={styles.label}>
            Floor or parking spot
          </Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Level 3, Spot 42"
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.gold}
            value={spot}
            onChangeText={setSpot}
            editable={!saved}
            accessibilityLabel="Floor or parking spot"
          />

          {saved ? (
            <>
              <Text style={styles.success}>
                Parking location saved!
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setSaved(false);
                  setGarage("");
                  setSpot("");
                }}
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>
                  Clear parking location
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={saveParking}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>
                Save my parking spot
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.note}>
          Parking information is stored only while this
          screen remains active. Persistent saving will
          be added in a future update.
        </Text>
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
      padding: 24,
      gap: 18,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      color: COLORS.text,
    },

    subtitle: {
      fontSize: 15,
      color: COLORS.muted,
    },

    card: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: 22,
      gap: 16,
    },

    heading: {
      fontSize: 20,
      fontWeight: "700",
      color: COLORS.text,
    },

    label: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.text,
    },

    input: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      color: COLORS.text,
      backgroundColor: COLORS.input,
    },

    button: {
      backgroundColor: COLORS.button,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },

    buttonText: {
      color: COLORS.buttonText,
      fontWeight: "700",
    },

    success: {
      color: COLORS.success,
      fontWeight: "700",
    },

    note: {
      color: COLORS.muted,
      fontSize: 13,
      lineHeight: 20,
    },
  });
}
