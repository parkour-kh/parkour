import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { getGarage } from "../../api";

type Spot = {
  id: string; // backend id, e.g. "a-1-03" = garage a, floor 1, space 03
  occupied: boolean;
};

type Floors = Record<number, Spot[]>;

const REFRESH_MS = 3000;

const GREEN = "#344238";
const GOLD = "#D4AF37";
const CREAM = "#F8FAF8";
const DARK = "#242424";

// The number shown on a tile: "a-1-03" -> "03"
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
  const [selectedFloor, setFloor] = useState<number>(1);
  const [floors, setFloors] = useState<Floors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedSpot, setSavedSpot] = useState<string | null>(null);

  // Fetch the real spots from the backend now, then every few seconds.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getGarage(garageId);
        if (cancelled) return;
        const next: Floors = {};
        for (const f of data.floors) {
          next[f.floor] = f.spots.map((s) => ({ id: s.id, occupied: s.status !== "OPEN" }));
        }
        setFloors(next);
        setLoadError(null);
      } catch {
        if (!cancelled) setLoadError("Can't reach the parking server. Retrying...");
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [garageId]);

  const floorNumbers = Object.keys(floors).map(Number).sort((a, b) => a - b);
  // if the selected floor doesn't exist (yet), fall back to the first real one
  const floor = floors[selectedFloor] ? selectedFloor : floorNumbers[0] ?? 1;
  const spots = floors[floor] ?? [];

  const available = spots.filter((spot) => !spot.occupied).length;
  const allSpots = Object.values(floors).flat();
  const totalSpots = allSpots.length;
  const totalAvailable = allSpots.filter((spot) => !spot.occupied).length;

  const recommended = useMemo(
    () => spots.find((spot) => !spot.occupied)?.id ?? null,
    [spots]
  );

  const half = Math.ceil(spots.length / 2);

  function renderSpot(spot: Spot) {
    const isRecommended = spot.id === recommended;

    return (
      <View
        key={spot.id}
        style={[
          styles.spot,
          spot.occupied ? styles.taken : styles.open,
          isRecommended && styles.recommendedSpot,
        ]}
      >
        <Text style={styles.spotIcon}>{spot.occupied ? "🚗" : "✓"}</Text>
        <Text style={styles.spotId}>{spotNumber(spot.id)}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>PARKOUR / GARAGE VIEW</Text>
      <Text style={styles.heading}>{garageName}</Text>
      <Text style={styles.subtitle}>
        Find your space, without the guesswork.
      </Text>
      {loadError && <Text style={styles.helper}>{loadError}</Text>}
      {!loadError && totalSpots === 0 && <Text style={styles.helper}>Loading spaces...</Text>}

      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>AVAILABLE SPACES</Text>
          <Text style={styles.summaryNumber}>{totalAvailable}<Text style={styles.summaryTotal}> / {totalSpots}</Text></Text>
        </View>
        <View style={styles.summaryIcon}>
          <Text style={styles.summaryCar}>P</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Select a floor</Text>
      <View style={styles.floorRow}>
        {floorNumbers.map((number) => (
          <Pressable
            key={number}
            onPress={() => setFloor(number)}
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

      <View style={styles.floorHeading}>
        <Text style={styles.sectionTitle}>Floor {floor}</Text>
        <Text style={styles.floorAvailability}>{available} open</Text>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>🟢 Open</Text>
        <Text style={styles.legendText}>⚪ Taken</Text>
        <Text style={styles.legendText}>⭐ Recommended</Text>
      </View>

      <View style={styles.garage}>
        <View style={styles.spotRow}>
          {spots.slice(0, half).map(renderSpot)}
        </View>

        <View style={styles.driveLane}>
          <Text style={styles.driveLaneText}>← DRIVE LANE →</Text>
        </View>

        <View style={styles.spotRow}>
          {spots.slice(half).map(renderSpot)}
        </View>
      </View>

      <Text style={styles.helper}>
        Live from the parking server. Updates every few seconds.
      </Text>

      <View style={styles.recommendation}>
        <Text style={styles.recommendationEyebrow}>YOUR BEST AVAILABLE SPACE</Text>
        <Text style={styles.recommendationTitle}>
          {recommended ? `Floor ${floor} · Spot ${spotNumber(recommended)}` : "Floor full"}
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
          >
            <Text style={styles.saveText}>Save My Spot</Text>
          </Pressable>
        )}

        {savedSpot && (
          <Text style={styles.savedText}>
            Saved: Floor {savedSpot.split("-")[1]}, Spot {spotNumber(savedSpot)}
          </Text>
        )}
      </View>

      <Text style={styles.disclaimer}>
        Prototype data: most spaces are simulated, a few are live sensors.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CREAM },
  content: { padding: 20, paddingBottom: 60 },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, color: GOLD, marginBottom: 8 },
  heading: { fontSize: 32, fontWeight: "800", color: DARK },
  subtitle: { color: "#77756F", fontSize: 14, marginTop: 5, marginBottom: 22 },
  summary: { backgroundColor: GREEN, borderRadius: 18, padding: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 26 },
  summaryLabel: { color: "#E8E6DB", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  summaryNumber: { color: GOLD, fontSize: 39, fontWeight: "800", marginTop: 5 },
  summaryTotal: { color: "#E8E6DB", fontSize: 19, fontWeight: "500" },
  summaryIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: GOLD, alignItems: "center", justifyContent: "center" },
  summaryCar: { fontSize: 28, fontWeight: "900", color: GREEN },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: DARK },
  floorRow: { flexDirection: "row", gap: 9, marginTop: 14, marginBottom: 25 },
  floorButton: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: "#D8DDD8", alignItems: "center", backgroundColor: "#FFFFFF" },
  floorSelected: { backgroundColor: GREEN, borderColor: GREEN },
  floorText: { color: GREEN, fontWeight: "700", fontSize: 13 },
  floorTextSelected: { color: "#FFFFFF" },
  floorHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  floorAvailability: { fontSize: 13, fontWeight: "700", color: GREEN },
  legend: { flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 16 },
  legendText: { fontSize: 11, color: "#77756F" },
  garage: { backgroundColor: "#EBEEE9", borderRadius: 16, padding: 10, borderWidth: 1, borderColor: "#D8DDD8" },
  spotRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 5 },
  spot: { width: "15%", height: 57, borderRadius: 7, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 5 },
  open: { backgroundColor: "#D8ECDD", borderColor: "#98C7A5" },
  taken: { backgroundColor: "#DADDD8", borderColor: "#BCC1BB" },
  recommendedSpot: { borderColor: GOLD, borderWidth: 3, backgroundColor: "#FFF2C8" },
  spotIcon: { fontSize: 16 },
  spotId: { fontSize: 10, fontWeight: "800", color: DARK, marginTop: 2 },
  driveLane: { backgroundColor: "#D3D8D1", height: 48, justifyContent: "center", alignItems: "center", marginVertical: 12, borderRadius: 7 },
  driveLaneText: { color: "#6C776E", fontWeight: "800", letterSpacing: 2, fontSize: 10 },
  helper: { textAlign: "center", fontSize: 12, color: "#77756F", marginTop: 12 },
  recommendation: { marginTop: 24, backgroundColor: "#FFFFFF", borderRadius: 17, padding: 20, borderWidth: 1, borderColor: "#E1E7E1" },
  recommendationEyebrow: { fontSize: 10, letterSpacing: 1, fontWeight: "800", color: GREEN },
  recommendationTitle: { fontSize: 22, fontWeight: "800", color: DARK, marginTop: 9 },
  recommendationDetail: { color: "#77756F", fontSize: 13, marginTop: 6 },
  saveButton: { marginTop: 18, backgroundColor: GREEN, borderRadius: 12, padding: 15, alignItems: "center" },
  saveText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  savedText: { color: GREEN, fontWeight: "700", marginTop: 14 },
  disclaimer: { color: "#77756F", fontSize: 11, textAlign: "center", marginTop: 22 },
});
