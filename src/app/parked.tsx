
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const COLORS = {
  background: "#F8FAF8",
  green: "#344238",
  gold: "#D4AF37",
  white: "#FFFFFF",
  muted: "#77756F",
  border: "#E1E7E1",
};

export default function ParkedScreen() {
  const router = useRouter();
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
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={26}
            color={COLORS.green}
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

          <Text style={styles.label}>Garage or lot</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Garage H"
            value={garage}
            onChangeText={setGarage}
            editable={!saved}
          />

          <Text style={styles.label}>
            Floor or parking spot
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Level 3, Spot 42"
            value={spot}
            onChangeText={setSpot}
            editable={!saved}
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

const styles = StyleSheet.create({
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
    color: COLORS.green,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    gap: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.green,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.green,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: COLORS.green,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  success: {
    color: COLORS.green,
    fontWeight: "700",
  },
  note: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
