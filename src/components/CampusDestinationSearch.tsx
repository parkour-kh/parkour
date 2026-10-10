import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type SelectedPlace = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Prediction = { place_id: string; name: string; address: string };

// Set EXPO_PUBLIC_API_URL in a .env file at the repo root, e.g. EXPO_PUBLIC_API_URL=http://192.168.1.23:5000
// (your computer's address, or a tunnel/hosted URL). Without it, Google results won't load
// and the built-in campus list below keeps working.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

const destinations: SelectedPlace[] = [
  { place_id: "library", name: "John C. Hitt Library", address: "UCF Main Campus", latitude: 28.6004, longitude: -81.2001 },
  { place_id: "union", name: "Student Union", address: "UCF Main Campus", latitude: 28.6010, longitude: -81.2004 },
  { place_id: "millican", name: "Millican Hall", address: "UCF Main Campus", latitude: 28.5991, longitude: -81.2008 },
  { place_id: "arena", name: "Addition Financial Arena", address: "UCF Main Campus", latitude: 28.6072, longitude: -81.1973 },
  { place_id: "engineering", name: "Engineering Building", address: "UCF Main Campus", latitude: 28.6017, longitude: -81.1988 },
  { place_id: "rec", name: "Recreation and Wellness Center", address: "UCF Main Campus", latitude: 28.5965, longitude: -81.1987 },
];

function newSessionToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Calls the Flask backend, which holds the Google Places key. The key never lives in the app.
async function post(path: string, payload: object) {
  if (!API_URL) throw new Error("EXPO_PUBLIC_API_URL is not set");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_URL}/api/places/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export default function CampusDestinationSearch({ onSelect }: { onSelect: (place: SelectedPlace) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sessionToken = useRef(newSessionToken());

  const trimmed = query.trim();
  const matches = trimmed.length > 0
    ? destinations.filter(d =>
        (d.name + " " + d.address + " " + d.place_id).toLowerCase().includes(trimmed.toLowerCase())
      )
    : [];

  // Ask Google for suggestions 300ms after the user stops typing.
  useEffect(() => {
    if (!API_URL || trimmed.length < 2) {
      setPredictions([]);
      setFailed(false);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await post("autocomplete", { query: trimmed, session_token: sessionToken.current });
        if (!cancelled) {
          setPredictions(data.predictions ?? []);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setPredictions([]);
          setFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [trimmed]);

  function choose(place: SelectedPlace) {
    setQuery(place.name);
    setFocused(false);
    setPredictions([]);
    onSelect(place);
  }

  async function choosePrediction(p: Prediction) {
    setLoading(true);
    try {
      const d = await post("details", { place_id: p.place_id, session_token: sessionToken.current });
      sessionToken.current = newSessionToken(); // a new session starts after each selection
      choose({ place_id: d.place_id, name: d.name, address: d.address, latitude: d.latitude, longitude: d.longitude });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit() {
    // Enter key: take the first campus match, otherwise the first Google suggestion.
    if (matches.length > 0) choose(matches[0]);
    else if (predictions.length > 0) choosePrediction(predictions[0]);
  }

  return (
    <View>
      <View style={s.search}>
        <Ionicons name="search-outline" size={21} color="#77756F" />
        <TextInput
          value={query}
          onChangeText={t => {
            setQuery(t);
            setFailed(false);
          }}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          placeholder="Search UCF destinations"
          placeholderTextColor="#77756F"
          style={s.input}
        />
        {loading && <ActivityIndicator size="small" color="#4B6CB7" />}
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

          {predictions.map(p => (
            <TouchableOpacity key={p.place_id} style={s.result} onPress={() => choosePrediction(p)}>
              <Ionicons name="location-outline" size={20} color="#4B6CB7" />
              <View style={s.aiText}>
                <Text style={s.name}>{p.name}</Text>
                {p.address ? <Text style={s.subtitle}>{p.address}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}

          {failed && (
            <View style={s.result}>
              <Text style={s.subtitle}>Google search is unavailable right now. Campus search still works.</Text>
            </View>
          )}

          <View style={s.footer}>
            <Text style={s.footerText}>Powered by Google</Text>
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
  aiText: { flex: 1 },
  name: { fontWeight: "600", fontSize: 14, color: "#242424" },
  subtitle: { color: "#77756F", fontSize: 12, marginTop: 2 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#F5F7FC" },
  footerText: { color: "#5F6368", fontSize: 11, fontWeight: "600" },
});
