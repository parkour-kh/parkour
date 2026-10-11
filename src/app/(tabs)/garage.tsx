
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { getGarage } from "../../api";
import { useParkourTheme } from "@/contexts/parkour-theme";

type Spot = {
  id: string;
  occupied: boolean;
};

type Floors = Record<number, Spot[]>;

const REFRESH_MS = 3000;

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
  saveButton: "#344238",
  saveText: "#FFFFFF",
  goldText: "#344238",
  error: "#B23B32",
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
  saveButton: "#D4AF37",
  saveText: "#242424",
  goldText: "#242424",
  error: "#FF9F98",
};

function spotNumber(id: string) {
  return id.split("-").pop() ?? id;
}

export default function GarageScreen({
  garageName = "Garage A",
  garageId = "a",
}: {
  garageName?: string;
  garageId?: string;
}) {
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const [selectedFloor, setFloor] = useState<number>(1);
  const [floors, setFloors] = useState<Floors>({});
  const [loadError, setLoadError] = useState<string | null>(
    null
  );
  const [savedSpot, setSavedSpot] = useState<string | null>(
    null
  );
  // the open space the user tapped (null = none, falls back to the recommended one)
  const [chosenSpot, setChosenSpot] = useState<string | null>(
    null
  );

  // Keep your teammate's backend integration.
  // Fetch spaces now, then refresh every 3 seconds.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getGarage(garageId);

        if (cancelled) return;

        const next: Floors = {};

        for (const floorData of data.floors) {
          next[floorData.floor] = floorData.spots.map(
            (spot) => ({
              id: spot.id,
              occupied: spot.status !== "OPEN",
            })
          );
        }

        setFloors(next);
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setLoadError(
            "Can't reach the parking server. Retrying..."
          );
        }
      }
    }

    void load();

    const timer = setInterval(() => {
      void load();
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [garageId]);

  const floorNumbers = Object.keys(floors)
    .map(Number)
    .sort((a, b) => a - b);

  const floor = floors[selectedFloor]
    ? selectedFloor
    : floorNumbers[0] ?? 1;

  const spots = floors[floor] ?? [];

  const available = spots.filter(
    (spot) => !spot.occupied
  ).length;

  const allSpots = Object.values(floors).flat();
  const totalSpots = allSpots.length;

  const totalAvailable = allSpots.filter(
    (spot) => !spot.occupied
  ).length;

  const recommended = useMemo(
    () => spots.find((spot) => !spot.occupied)?.id ?? null,
    [spots]
  );

  const half = Math.ceil(spots.length / 2);

  // The tapped space counts only while it is still open (live data can change under us).
  const chosen =
    chosenSpot &&
    allSpots.some((s) => s.id === chosenSpot && !s.occupied)
      ? chosenSpot
      : null;

  // What "Save My Spot" saves: the tapped space, else the recommended one.
  const target = chosen ?? recommended;
  const targetFloor = target ? target.split("-")[1] : String(floor);

  function renderSpot(spot: Spot) {
    const isRecommended = spot.id === recommended;
    const isChosen = spot.id === chosen;

    const tileStyle = [
      styles.spot,
      spot.occupied ? styles.taken : styles.open,
      isRecommended && !isChosen && styles.recommendedSpot,
      isChosen && styles.selectedSpot,
    ];

    const label = `Spot ${spotNumber(spot.id)}, ${
      spot.occupied ? "occupied" : "available"
    }${isRecommended ? ", recommended" : ""}${
      isChosen ? ", selected" : ""
    }`;

    const content = (
      <>
        <Text style={styles.spotIcon}>
          {spot.occupied ? "🚗" : isChosen ? "★" : "✓"}
        </Text>

        <Text style={styles.spotId}>
          {spotNumber(spot.id)}
        </Text>
      </>
    );

    // Taken spaces can't be picked; open spaces can.
    if (spot.occupied) {
      return (
        <View
          key={spot.id}
          style={tileStyle}
          accessible
          accessibilityLabel={label}
        >
          {content}
        </View>
      );
    }

    return (
      <Pressable
        key={spot.id}
        onPress={() =>
          setChosenSpot(isChosen ? null : spot.id)
        }
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isChosen }}
        style={tileStyle}
      >
        {content}
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

      {loadError && (
        <Text style={styles.errorText}>
          {loadError}
        </Text>
      )}

      {!loadError && totalSpots === 0 && (
        <Text style={styles.helper}>
          Loading spaces...
        </Text>
      )}

      {/* AVAILABILITY SUMMARY */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>
            AVAILABLE SPACES
          </Text>

          <Text style={styles.summaryNumber}>
            {totalAvailable}
            <Text style={styles.summaryTotal}>
              {" "} / {totalSpots}
            </Text>
          </Text>
        </View>

        <View style={styles.summaryIcon}>
          <Text style={styles.summaryCar}>
            P
          </Text>
        </View>
      </View>

      {/* FLOOR SELECTION */}
      <Text style={styles.sectionTitle}>
        Select a floor
      </Text>

      <View style={styles.floorRow}>
        {floorNumbers.map((number) => (
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

      {/* SELECTED FLOOR */}
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
        <Text style={styles.legendText}>
          🟢 Open
        </Text>

        <Text style={styles.legendText}>
          ⚪ Taken
        </Text>

        <Text style={styles.legendText}>
          ⭐ Recommended
        </Text>
      </View>

      {/* PARKING SPACE GRID */}
      <View style={styles.garage}>
        <View style={styles.spotRow}>
          {spots.slice(0, half).map(renderSpot)}
        </View>

        <View style={styles.driveLane}>
          <Text style={styles.driveLaneText}>
            ← DRIVE LANE →
          </Text>
        </View>

        <View style={styles.spotRow}>
          {spots.slice(half).map(renderSpot)}
        </View>
      </View>

      <Text style={styles.helper}>
        Tap an open space to select it. Availability
        comes from the server and refreshes every few
        seconds.
      </Text>

      {/* RECOMMENDATION / SELECTION */}
      <View style={styles.recommendation}>
        <Text style={styles.recommendationEyebrow}>
          {chosen
            ? "YOUR SELECTED SPACE"
            : "YOUR BEST AVAILABLE SPACE"}
        </Text>

        <Text style={styles.recommendationTitle}>
          {target
            ? `Floor ${targetFloor} · Spot ${spotNumber(target)}`
            : totalSpots === 0
              ? "Waiting for parking data"
              : "Floor full"}
        </Text>

        <Text style={styles.recommendationDetail}>
          {chosen
            ? "You picked this space. Tap it again to clear."
            : recommended
              ? "Highlighted in gold on the garage map."
              : totalSpots === 0
                ? "Parking spaces will appear when the server responds."
                : "Try selecting another floor."}
        </Text>

        {target && (
          <Pressable
            style={styles.saveButton}
            onPress={() => setSavedSpot(target)}
            accessibilityRole="button"
          >
            <Text style={styles.saveText}>
              Save My Spot
            </Text>
          </Pressable>
        )}

        {savedSpot && (
          <Text style={styles.savedText}>
            Saved: Floor {savedSpot.split("-")[1]},
            Spot {spotNumber(savedSpot)}
          </Text>
        )}
      </View>

      <Text style={styles.disclaimer}>
        Prototype data: most spaces are simulated,
        and a few are connected to live sensors.
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

    errorText: {
      color: COLORS.error,
      fontSize: 13,
      marginBottom: 14,
      lineHeight: 20,
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

    selectedSpot: {
      borderColor: COLORS.text,
      borderWidth: 3,
      backgroundColor: COLORS.openBorder,
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
      borderColor: COLORS.border,
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
