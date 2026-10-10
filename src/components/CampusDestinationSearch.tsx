import React, { useState } from "react";
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type SelectedPlace = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

// Set EXPO_PUBLIC_API_URL in a .env file at the repo root, e.g. EXPO_PUBLIC_API_URL=http://192.168.1.23:5000
// (your computer's address, or a tunnel/Vultr URL). Without it, the Gemini row shows "unavailable"
// and the normal search below keeps working.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

const destinations: SelectedPlace[] = [
  { place_id: "library", name: "John C. Hitt Library", address: "UCF Main Campus", latitude: 28.6004, longitude: -81.2001 },
  { place_id: "union", name: "Student Union", address: "UCF Main Campus", latitude: 28.6010, longitude: -81.2004 },
  { place_id: "millican", name: "Millican Hall", address: "UCF Main Campus", latitude: 28.5991, longitude: -81.2008 },
  { place_id: "arena", name: "Addition Financial Arena", address: "UCF Main Campus", latitude: 28.6072, longitude: -81.1973 },
  { place_id: "engineering", name: "Engineering Building", address: "UCF Main Campus", latitude: 28.6017, longitude: -81.1988 },
  { place_id: "rec", name: "Recreation and Wellness Center", address: "UCF Main Campus", latitude: 28.5965, longitude: -81.1987 },
];

type AiStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "nomatch"; aiUsed: boolean }
  | { state: "error" };

// Calls the Flask backend. Only runs when the user asks for it (tap the row or press search),
// never on every keystroke, so it stays fast and well inside Gemini's rate limits.
async function smartSearch(text: string): Promise<{ place: SelectedPlace | null; aiUsed: boolean }> {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL is not set");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const m = data.matches?.[0];
    const place: SelectedPlace | null = m
      ? { place_id: m.id, name: m.name, address: "UCF Main Campus", latitude: m.latitude, longitude: m.longitude }
      : null;
    return { place, aiUsed: Boolean(data.ai_used) };
  } finally {
    clearTimeout(timer);
  }
}

export default function CampusDestinationSearch({ onSelect }: { onSelect: (place: SelectedPlace) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [ai, setAi] = useState<AiStatus>({ state: "idle" });

  const trimmed = query.trim();
  const matches = trimmed.length > 0
    ? destinations.filter(d =>
        (d.name + " " + d.address + " " + d.place_id).toLowerCase().includes(trimmed.toLowerCase())
      )
    : [];

  function choose(place: SelectedPlace) {
    setQuery(place.name);
    setFocused(false);
    setAi({ state: "idle" });
    onSelect(place);
  }

  async function askGemini() {
    if (trimmed.length === 0 || ai.state === "loading") return;
    setAi({ state: "loading" });
    try {
      const { place, aiUsed } = await smartSearch(trimmed);
      if (place) choose(place);
      else setAi({ state: "nomatch", aiUsed });
    } catch {
      setAi({ state: "error" });
    }
  }

  function onSubmit() {
    // Enter key: take the first normal match if there is one, otherwise let Gemini work it out.
    if (matches.length > 0) choose(matches[0]);
    else askGemini();
  }

  return (
    <View>
      <View style={s.search}>
        <Ionicons name="search-outline" size={21} color="#77756F" />
        <TextInput
          value={query}
          onChangeText={t => {
            setQuery(t);
            setAi({ state: "idle" });
          }}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          placeholder="Search UCF destinations"
          placeholderTextColor="#77756F"
          style={s.input}
        />
      </View>

      {focused && trimmed.length > 0 && (
        <View style={s.results}>
          {matches.map(d => (
            <TouchableOpacity key={d.place_id} style={s.result} onPress={() => choose(d)}>
              <Ionicons name="location-outline" size={20} color="#D4AF37" />
              <View>
                <Text style={s.name}>{d.name}</Text>
                <Text style={s.subtitle}>{d.address}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Smart search row */}
          <TouchableOpacity style={s.aiRow} onPress={askGemini} disabled={ai.state === "loading"}>
            <Ionicons name="sparkles-outline" size={20} color="#4B6CB7" />
            <View style={s.aiText}>
              <Text style={s.name}>Search a destination</Text>
              {ai.state === "nomatch" && (
                <Text style={s.subtitle}>Couldn&apos;t match that to a campus destination. Try a building name.</Text>
              )}
              {ai.state === "error" && (
                <Text style={s.subtitle}>Smart search is unavailable right now. Regular search still works.</Text>
              )}
            </View>
            {ai.state === "loading" && <ActivityIndicator size="small" color="#4B6CB7" />}
          </TouchableOpacity>

          <View style={s.footer}>
            <Ionicons name="sparkles" size={12} color="#4B6CB7" />
            <Text style={s.footerText}>
              {ai.state === "nomatch" && !ai.aiUsed ? "Matched by keyword search" : "Powered by Gemini"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  search: { height: 54, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1, borderColor: "#D9D4C3", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 15, color: "#242424" },
  results: { backgroundColor: "#FFFFFF", marginTop: 7, borderRadius: 12, borderWidth: 1, borderColor: "#E5E5E0", overflow: "hidden" },
  result: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  aiRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "#F5F7FC" },
  aiText: { flex: 1 },
  name: { fontWeight: "600", fontSize: 14, color: "#242424" },
  subtitle: { color: "#77756F", fontSize: 12, marginTop: 2 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 5, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#F5F7FC" },
  footerText: { color: "#4B6CB7", fontSize: 11, fontWeight: "600" },
});
