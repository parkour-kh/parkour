
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { useParkourTheme } from "@/contexts/parkour-theme";

type Spot = {
  id: string;
  occupied: boolean;
};

type FloorNumber = 1 | 2 | 3;

const LIGHT_COLORS = {
  background: "#F8FAF8",
  text: "#242424",
  muted: "#77756F",
  green: "#344238",
  gold: "#D4AF37",
  surface: "#FFFFFF",
  border: "#D8DDD8",
  summary: "#344238",
  summaryMuted: "#E8E6DB",
  selectedFloor: "#344238",
  selectedFloorText: "#FFFFFF",
  floorText: "#344238",
  garage: "#EBEEE9",
  open: "#D8ECDD",
  openBorder: "#98C7A5",
  taken: "#DADDD8",
  takenBorder: "#BCC1BB",
  recommended: "#FFF2C8",
  spotText: "#242424",
  driveLane: "#D3D8D1",
  driveLaneText: "#6C776E",
  cardBorder: "#E1E7E1",
  saveButton: "#344238",
  saveText: "#FFFFFF",
  goldText: "#344238",
};

const DARK_COLORS = {
  background: "#101827",
  text: "#FFFFFF",
  muted: "#AAB4C4",
  green: "#D4AF37",
  gold: "#D4AF37",
  surface: "#202B3C",
  border: "#354358",
  summary: "#182335",
  summaryMuted: "#C6D1DE",
  selectedFloor: "#D4AF37",
  selectedFloorText: "#242424",
  floorText: "#FFFFFF",
  garage: "#182335",
  open: "#284D3B",
  openBorder: "#477D60",
  taken: "#394151",
  takenBorder: "#586579",
  recommended: "#735D2C",
  spotText: "#FFFFFF",
  driveLane: "#354358",
  driveLaneText: "#D1D9E6",
  cardBorder: "#354358",
  saveButton: "#D4AF37",
  saveText: "#242424",
  goldText: "#242424",
};

function createFloor(floor: FloorNumber): Spot[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `${floor}-${String(i + 1).padStart(2, "0")}`,
    occupied: (i * 7 + floor * 3) % 9 < 3,
  }));
}

export default function GarageScreen({
  garageName = "Garage A",
}: {
  garageName?: string;
}) {
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const [floor, setFloor] = useState<FloorNumber>(1);

  const [floors, setFloors] = useState<Record<FloorNumber, Spot[]>>({
    1: createFloor(1),
    2: createFloor(2),
    3: createFloor(3),
  });

  const [savedSpot, setSavedSpot] = useState<string | null>(null);

  const spots = floors[floor];

  const available = spots.filter(
    (spot) => !spot.occupied
  ).length;

  const totalAvailable = Object.values(floors)
    .flat()
    .filter((spot) => !spot.occupied).length;

  const recommended = useMemo(
    () => spots.find((spot) => !spot.occupied)?.id ?? null,
    [spots]
  );

  function toggleSpot(id: string) {
    setFloors((current) => ({
      ...current,
      [floor]: current[floor].map((spot) =>
        spot.id === id
          ? { ...spot, occupied: !spot.occupied }
          : spot
      ),
    }));
  }

  function renderSpot(spot: Spot) {
    const isRecommended = spot.id === recommended;

    return (
      <Pressable
        key={spot.id}
        onPress={() => toggleSpot(spot.id)}
        accessibilityRole="button"
        accessibilityLabel={`Spot ${spot.id}, ${
          spot.occupied ? "occupied" : "available"
        }`}
        style={[
          styles.spot,
          spot.occupied ? styles.taken : styles.open,
          isRecommended && styles.recommendedSpot,
        ]}
      >
        <Text style={styles.spotIcon}>
          {spot.occupied ? "🚗" : "✓"}
        </Text>

        <Text style={styles.spotId}>
          {spot.id.split("-")[1]}
        </Text>
      </Pressable>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>
        PARKOUR / GARAGE VIEW
      </Text>

      <Text style={styles.heading}>
        {garageName}
      </Text>

      <Text style={styles.subtitle}>
        Find your space, without the guesswork.
      </Text>

      {/* TOTAL AVAILABILITY */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>
            AVAILABLE SPACES
          </Text>

          <Text style={styles.summaryNumber}>
            {totalAvailable}
            <Text style={styles.summaryTotal}>
              {" "} / 72
            </Text>
          </Text>
        </View>

        <View style={styles.summaryIcon}>
          <Text style={styles.summaryCar}>P</Text>
        </View>
      </View>

      {/* FLOOR SELECTION */}
      <Text style={styles.sectionTitle}>
        Select a floor
      </Text>

      <View style={styles.floorRow}>
        {([1, 2, 3] as FloorNumber[]).map((number) => (
          <Pressable
            key={number}
            onPress={() => setFloor(number)}
            accessibilityRole="button"
            accessibilityState={{
              selected: floor === number,
            }}
            style={[
              styles.floorButton,
              floor === number && styles.floorSelected,
            ]}
          >
            <Text
              style={[
                styles.floorText,
                floor === number && styles.floorTextSelected,
              ]}
            >
              Floor {number}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* FLOOR AVAILABILITY */}
      <View style={styles.floorHeading}>
        <Text style={styles.sectionTitle}>
          Floor {floor}
        </Text>

        <Text style={styles.floorAvailability}>
          {available} open
        </Text>
      </View>

      {/* LEGEND */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>🟢 Open</Text>
        <Text style={styles.legendText}>⚪ Taken</Text>
        <Text style={styles.legendText}>⭐ Recommended</Text>
      </View>

      {/* INTERACTIVE GARAGE */}
      <View style={styles.garage}>
        <View style={styles.spotRow}>
          {spots.slice(0, 12).map(renderSpot)}
        </View>

        <View style={styles.driveLane}>
          <Text style={styles.driveLaneText}>
            ← DRIVE LANE →
          </Text>
        </View>

        <View style={styles.spotRow}>
          {spots.slice(12, 24).map(renderSpot)}
        </View>
      </View>

      <Text style={styles.helper}>
        Tap any space to simulate a car arriving or leaving.
      </Text>

      {/* RECOMMENDED SPACE */}
      <View style={styles.recommendation}>
        <Text style={styles.recommendationEyebrow}>
          YOUR BEST AVAILABLE SPACE
        </Text>

        <Text style={styles.recommendationTitle}>
          {recommended
            ? `Floor ${floor} · Spot ${recommended.split("-")[1]}`
            : "Floor full"}
        </Text>

        <Text style={styles.recommendationDetail}>
          {recommended
            ? "Highlighted in gold on the garage map."
            : "Try selecting another floor."}
        </Text>

        {recommended && (
          <Pressable
            style={styles.saveButton}
            onPress={() => setSavedSpot(recommended)}
            accessibilityRole="button"
          >
            <Text style={styles.saveText}>
              Save My Spot
            </Text>
          </Pressable>
        )}

        {savedSpot && (
          <Text style={styles.savedText}>
            Saved: Floor {savedSpot.split("-")[0]},
            Spot {savedSpot.split("-")[1]}
          </Text>
        )}
      </View>

      <Text style={styles.disclaimer}>
        Prototype parking data. Live Raspberry Pi updates coming next.
      </Text>
    </ScrollView>
  );
}

function createStyles(COLORS: typeof LIGHT_COLORS) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    content: {
      padding: 20,
      paddingBottom: 60,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 2,
      color: COLORS.gold,
      marginBottom: 8,
    },

    heading: {
      fontSize: 32,
      fontWeight: "800",
      color: COLORS.text,
    },

    subtitle: {
      color: COLORS.muted,
      fontSize: 14,
      marginTop: 5,
      marginBottom: 22,
    },

    summary: {
      backgroundColor: COLORS.summary,
      borderRadius: 18,
      padding: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 26,
    },

    summaryLabel: {
      color: COLORS.summaryMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
    },

    summaryNumber: {
      color: COLORS.gold,
      fontSize: 39,
      fontWeight: "800",
      marginTop: 5,
    },

    summaryTotal: {
      color: COLORS.summaryMuted,
      fontSize: 19,
      fontWeight: "500",
    },

    summaryIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: COLORS.gold,
      alignItems: "center",
      justifyContent: "center",
    },

    summaryCar: {
      fontSize: 28,
      fontWeight: "900",
      color: COLORS.goldText,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: COLORS.text,
    },

    floorRow: {
      flexDirection: "row",
      gap: 9,
      marginTop: 14,
      marginBottom: 25,
    },

    floorButton: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: "center",
      backgroundColor: COLORS.surface,
    },

    floorSelected: {
      backgroundColor: COLORS.selectedFloor,
      borderColor: COLORS.selectedFloor,
    },

    floorText: {
      color: COLORS.floorText,
      fontWeight: "700",
      fontSize: 13,
    },

    floorTextSelected: {
      color: COLORS.selectedFloorText,
    },

    floorHeading: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    floorAvailability: {
      fontSize: 13,
      fontWeight: "700",
      color: COLORS.green,
    },

    legend: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 14,
      marginBottom: 16,
    },

    legendText: {
      fontSize: 11,
      color: COLORS.muted,
    },

    garage: {
      backgroundColor: COLORS.garage,
      borderRadius: 16,
      padding: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    spotRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 5,
    },

    spot: {
      width: "15%",
      height: 57,
      borderRadius: 7,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 5,
    },

    open: {
      backgroundColor: COLORS.open,
      borderColor: COLORS.openBorder,
    },

    taken: {
      backgroundColor: COLORS.taken,
      borderColor: COLORS.takenBorder,
    },

    recommendedSpot: {
      borderColor: COLORS.gold,
      borderWidth: 3,
      backgroundColor: COLORS.recommended,
    },

    spotIcon: {
      fontSize: 16,
    },

    spotId: {
      fontSize: 10,
      fontWeight: "800",
      color: COLORS.spotText,
      marginTop: 2,
    },

    driveLane: {
      backgroundColor: COLORS.driveLane,
      height: 48,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 12,
      borderRadius: 7,
    },

    driveLaneText: {
      color: COLORS.driveLaneText,
      fontWeight: "800",
      letterSpacing: 2,
      fontSize: 10,
    },

    helper: {
      textAlign: "center",
      fontSize: 12,
      color: COLORS.muted,
      marginTop: 12,
    },

    recommendation: {
      marginTop: 24,
      backgroundColor: COLORS.surface,
      borderRadius: 17,
      padding: 20,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },

    recommendationEyebrow: {
      fontSize: 10,
      letterSpacing: 1,
      fontWeight: "800",
      color: COLORS.green,
    },

    recommendationTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: COLORS.text,
      marginTop: 9,
    },

    recommendationDetail: {
      color: COLORS.muted,
      fontSize: 13,
      marginTop: 6,
    },

    saveButton: {
      marginTop: 18,
      backgroundColor: COLORS.saveButton,
      borderRadius: 12,
      padding: 15,
      alignItems: "center",
    },

    saveText: {
      color: COLORS.saveText,
      fontWeight: "800",
      fontSize: 14,
    },

    savedText: {
      color: COLORS.green,
      fontWeight: "700",
      marginTop: 14,
    },

    disclaimer: {
      color: COLORS.muted,
      fontSize: 11,
      textAlign: "center",
      marginTop: 22,
    },
  });
}
