import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getGarages, type GarageSummary } from "../../api";
import GarageScreen from "./garage";

// Web version of Explore. The native version uses react-native-maps and GPS, which don't
// exist in a browser (the page crashed to a blank screen). This lists the garages from the
// live backend instead; tap one to see its spots.
const GREEN = "#344238";
const GOLD = "#D4AF37";
const CREAM = "#F8FAF8";
const DARK = "#242424";
const REFRESH_MS = 5000;

export default function ExploreWeb() {
  const [garages, setGarages] = useState<GarageSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GarageSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getGarages();
        if (cancelled) return;
        setGarages(data);
        setError(null);
      } catch {
        if (!cancelled) setError("Can't reach the parking server. Retrying...");
      }
    }

    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (selected) {
    return (
      <SafeAreaView style={styles.screen}>
        <Pressable onPress={() => setSelected(null)} style={styles.back}>
          <Text style={styles.backText}>← Back to garages</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <GarageScreen garageId={selected.id} garageName={selected.name} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>PARKOUR / EXPLORE</Text>
        <Text style={styles.heading}>Garages</Text>
        <Text style={styles.subtitle}>Live availability. Tap a garage to see its spaces.</Text>

        {error && <Text style={styles.error}>{error}</Text>}
        {!garages && !error && <ActivityIndicator color={GREEN} style={{ marginTop: 24 }} />}

        {garages?.map((g) => {
          const total = g.open + g.taken;
          return (
            <Pressable key={g.id} onPress={() => setSelected(g)} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{g.name}</Text>
                <Text style={styles.cardMeta}>
                  {g.permits?.length ? g.permits.join(" · ") : "All permits"}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeNumber}>{g.open}</Text>
                <Text style={styles.badgeLabel}>of {total} open</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CREAM },
  content: { padding: 20, paddingBottom: 60 },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, color: GOLD, marginBottom: 8 },
  heading: { fontSize: 32, fontWeight: "800", color: DARK },
  subtitle: { color: "#77756F", fontSize: 14, marginTop: 5, marginBottom: 22 },
  error: { color: "#B3261E", marginBottom: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E7E1",
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 20, fontWeight: "800", color: DARK },
  cardMeta: { color: "#77756F", fontSize: 12, marginTop: 4 },
  badge: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 14, alignItems: "center" },
  badgeNumber: { color: GOLD, fontSize: 24, fontWeight: "800" },
  badgeLabel: { color: "#E8E6DB", fontSize: 11, fontWeight: "600" },
  back: { backgroundColor: GREEN, padding: 16 },
  backText: { color: "#FFFFFF", fontWeight: "700" },
});
