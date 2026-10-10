
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type ParkingSpot = {
  garage: string;
  floor: string;
  spot: string;
};

const DEMO_SPOTS: ParkingSpot[] = [
  { garage: "Garage A", floor: "2", spot: "B24" },
  { garage: "Garage A", floor: "2", spot: "B25" },
  { garage: "Garage A", floor: "3", spot: "C12" },
];

export default function MySpotScreen() {
  const router = useRouter();

  const [step, setStep] = useState<"start" | "confirm" | "saved">("start");
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);

  useEffect(() => {
    async function loadSavedSpot() {
      try {
        const stored = await AsyncStorage.getItem("myParkingSpot");

        if (stored) {
          const parsed = JSON.parse(stored) as ParkingSpot;
          setSelectedSpot(parsed);
          setStep("saved");
        }
      } catch {
        Alert.alert("Error", "Could not load your saved spot.");
      }
    }

    void loadSavedSpot();
  }, []);

  function showDemoSpots() {
    setSelectedSpot(DEMO_SPOTS[0]);
    setStep("confirm");
  }

  async function confirmSpot() {
    if (!selectedSpot) return;

    try {
      await AsyncStorage.setItem(
        "myParkingSpot",
        JSON.stringify(selectedSpot)
      );

      setStep("saved");
    } catch {
      Alert.alert("Error", "Could not save your parking spot.");
    }
  }

  async function clearSpot() {
    try {
      await AsyncStorage.removeItem("myParkingSpot");
      setSelectedSpot(null);
      setStep("start");
    } catch {
      Alert.alert("Error", "Could not clear your saved spot.");
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      {step === "start" && (
        <>
          <Text style={styles.emoji}>🚗</Text>
          <Text style={styles.title}>Already Parked?</Text>

          <Text style={styles.subtitle}>
            Find and save your parking spot without typing
            in your garage, floor, or spot number.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How it works</Text>
            <Text style={styles.info}>📍 Find your garage</Text>
            <Text style={styles.info}>📷 Check occupied spots</Text>
            <Text style={styles.info}>✓ Confirm where you parked</Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={showDemoSpots}
          >
            <Text style={styles.buttonText}>
              Try Parking Detection Demo
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Demo mode: The next screen uses sample parking
            spots. Live camera detection is not connected yet.
          </Text>
        </>
      )}

      {step === "confirm" && (
        <>
          <Text style={styles.title}>Confirm Your Spot</Text>

          <Text style={styles.subtitle}>
            Choose your parking location from these demo
            examples. Nothing is saved until you confirm.
          </Text>

          {DEMO_SPOTS.map((item, index) => {
            const isSelected =
              selectedSpot?.garage === item.garage &&
              selectedSpot?.floor === item.floor &&
              selectedSpot?.spot === item.spot;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.spotCard,
                  isSelected && styles.selectedCard,
                ]}
                onPress={() => setSelectedSpot(item)}
              >
                <Text style={styles.spotTitle}>
                  {item.garage}
                </Text>

                <Text style={styles.spotDetail}>
                  Floor {item.floor} · Spot {item.spot}
                </Text>

                <Text style={styles.selection}>
                  {isSelected ? "✓ Selected" : "Tap to select"}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.button}
            onPress={confirmSpot}
          >
            <Text style={styles.buttonText}>
              Yes, Save My Spot
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep("start")}>
            <Text style={styles.secondaryAction}>
              ← Back to Start
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === "saved" && selectedSpot && (
        <>
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.title}>Parking Spot Saved!</Text>

          <Text style={styles.subtitle}>
            Your parking location is saved on this device.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Your Parking Location
            </Text>

            <Text style={styles.savedDetail}>
              🏢 {selectedSpot.garage}
            </Text>

            <Text style={styles.savedDetail}>
              🅿️ Floor {selectedSpot.floor}
            </Text>

            <Text style={styles.savedDetail}>
              🚗 Spot {selectedSpot.spot}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setSelectedSpot(null);
              setStep("start");
            }}
          >
            <Text style={styles.buttonText}>
              Start New Parking Session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clearSpot}>
            <Text style={styles.deleteText}>
              Clear Saved Spot
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F3",
  },
  content: {
    padding: 24,
    paddingTop: 55,
    paddingBottom: 70,
  },
  back: {
    fontSize: 17,
    color: "#242424",
    marginBottom: 45,
  },
  emoji: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#242424",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: "#77756F",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#F3F0E8",
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 18,
    color: "#242424",
  },
  info: {
    fontSize: 16,
    marginBottom: 18,
    color: "#344238",
  },
  button: {
    backgroundColor: "#D4AF37",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#242424",
    textAlign: "center",
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    color: "#77756F",
    textAlign: "center",
    marginTop: 20,
  },
  spotCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DED8C8",
    padding: 20,
    marginBottom: 14,
  },
  selectedCard: {
    borderColor: "#D4AF37",
    borderWidth: 2,
    backgroundColor: "#FFF9E8",
  },
  spotTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#242424",
  },
  spotDetail: {
    fontSize: 16,
    color: "#55534F",
    marginTop: 8,
  },
  selection: {
    color: "#344238",
    marginTop: 12,
    fontWeight: "600",
  },
  savedDetail: {
    fontSize: 18,
    color: "#344238",
    marginBottom: 18,
  },
  secondaryAction: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 16,
    color: "#344238",
  },
  deleteText: {
    textAlign: "center",
    marginTop: 25,
    color: "#C0392B",
    fontSize: 16,
  },
});

