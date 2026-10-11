
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
import { useParkourTheme } from "@/contexts/parkour-theme";

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

const LIGHT_COLORS = {
  background: "#FAF8F3",
  text: "#242424",
  muted: "#77756F",
  card: "#F3F0E8",
  spotCard: "#FFFFFF",
  selected: "#FFF9E8",
  border: "#DED8C8",
  detail: "#55534F",
  green: "#344238",
  gold: "#D4AF37",
  buttonText: "#242424",
  danger: "#C0392B",
};

const DARK_COLORS = {
  background: "#101827",
  text: "#FFFFFF",
  muted: "#AAB4C4",
  card: "#202B3C",
  spotCard: "#202B3C",
  selected: "#394151",
  border: "#354358",
  detail: "#E4E7EC",
  green: "#E0C46E",
  gold: "#D4AF37",
  buttonText: "#242424",
  danger: "#FF8E86",
};

export default function MySpotScreen() {
  const router = useRouter();
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const [step, setStep] = useState<"start" | "confirm" | "saved">(
    "start"
  );

  const [selectedSpot, setSelectedSpot] =
    useState<ParkingSpot | null>(null);

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
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      {/* START SCREEN */}
      {step === "start" && (
        <>
          <Text style={styles.emoji}>🚗</Text>

          <Text style={styles.title}>Find My Parking Spot</Text>

          <Text style={styles.subtitle}>
            Keep track of where you parked so it's easier
            to find your car later.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How it works</Text>

            <Text style={styles.info}>
              1. Find your garage
            </Text>

            <Text style={styles.info}>
              2. Check occupied spots
            </Text>

            <Text style={styles.info}>
              3. Confirm where you parked
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={showDemoSpots}
            accessibilityRole="button"
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

      {/* CONFIRM SCREEN */}
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
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
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
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              Yes, Save My Spot
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStep("start")}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryAction}>
              ← Go Back
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* SAVED SCREEN */}
      {step === "saved" && selectedSpot && (
        <>
          <Text style={styles.emoji}>📍</Text>

          <Text style={styles.title}>Your Saved Spot</Text>

          <Text style={styles.subtitle}>
            Your parking location has been saved.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              ✓ {selectedSpot.garage}
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
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              Start New Parking Session
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearSpot}
            accessibilityRole="button"
          >
            <Text style={styles.deleteText}>
              Clear Saved Spot
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
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
      paddingTop: 55,
      paddingBottom: 70,
    },

    back: {
      fontSize: 17,
      color: COLORS.text,
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
      color: COLORS.text,
      marginBottom: 12,
    },

    subtitle: {
      fontSize: 16,
      lineHeight: 25,
      color: COLORS.muted,
      marginBottom: 30,
    },

    card: {
      backgroundColor: COLORS.card,
      borderRadius: 18,
      padding: 22,
      marginBottom: 28,
    },

    cardTitle: {
      fontSize: 19,
      fontWeight: "700",
      marginBottom: 18,
      color: COLORS.text,
    },

    info: {
      fontSize: 16,
      marginBottom: 18,
      color: COLORS.green,
    },

    button: {
      backgroundColor: COLORS.gold,
      padding: 20,
      borderRadius: 15,
      alignItems: "center",
      marginTop: 10,
    },

    buttonText: {
      fontSize: 17,
      fontWeight: "700",
      color: COLORS.buttonText,
      textAlign: "center",
    },

    note: {
      fontSize: 13,
      lineHeight: 20,
      color: COLORS.muted,
      textAlign: "center",
      marginTop: 20,
    },

    spotCard: {
      backgroundColor: COLORS.spotCard,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: 20,
      marginBottom: 14,
    },

    selectedCard: {
      borderColor: COLORS.gold,
      borderWidth: 2,
      backgroundColor: COLORS.selected,
    },

    spotTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: COLORS.text,
    },

    spotDetail: {
      fontSize: 16,
      color: COLORS.detail,
      marginTop: 8,
    },

    selection: {
      color: COLORS.green,
      marginTop: 12,
      fontWeight: "600",
    },

    savedDetail: {
      fontSize: 18,
      color: COLORS.green,
      marginBottom: 18,
    },

    secondaryAction: {
      textAlign: "center",
      marginTop: 24,
      fontSize: 16,
      color: COLORS.green,
    },

    deleteText: {
      textAlign: "center",
      marginTop: 25,
      color: COLORS.danger,
      fontSize: 16,
    },
  });
}
