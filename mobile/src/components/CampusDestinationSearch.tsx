import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type SelectedPlace = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

const destinations: SelectedPlace[] = [
  { place_id: "library", name: "John C. Hitt Library", address: "UCF Main Campus", latitude: 28.6004, longitude: -81.2001 },
  { place_id: "union", name: "Student Union", address: "UCF Main Campus", latitude: 28.6010, longitude: -81.2004 },
  { place_id: "millican", name: "Millican Hall", address: "UCF Main Campus", latitude: 28.5991, longitude: -81.2008 },
  { place_id: "arena", name: "Addition Financial Arena", address: "UCF Main Campus", latitude: 28.6072, longitude: -81.1973 },
  { place_id: "engineering", name: "Engineering Building", address: "UCF Main Campus", latitude: 28.6017, longitude: -81.1988 },
  { place_id: "rec", name: "Recreation and Wellness Center", address: "UCF Main Campus", latitude: 28.5965, longitude: -81.1987 },
];

export default function CampusDestinationSearch({ onSelect }: { onSelect: (place: SelectedPlace) => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const matches = query.trim().length > 0
    ? destinations.filter(d =>
        (d.name + " " + d.address + " " + d.place_id).toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <View>
      <View style={s.search}>
        <Ionicons name="search-outline" size={21} color="#77756F" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          placeholder="Search UCF destinations"
          placeholderTextColor="#77756F"
          style={s.input}
        />
      </View>
      {focused && query.length > 0 && (
        <View style={s.results}>
          {matches.length === 0 && <Text style={s.empty}>No matching campus destinations</Text>}
          {matches.map(d => (
            <TouchableOpacity
              key={d.place_id}
              style={s.result}
              onPress={() => {
                setQuery(d.name);
                setFocused(false);
                onSelect(d);
              }}
            >
              <Ionicons name="location-outline" size={20} color="#D4AF37" />
              <View>
                <Text style={s.name}>{d.name}</Text>
                <Text style={s.subtitle}>{d.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  name: { fontWeight: "600", fontSize: 14, color: "#242424" },
  subtitle: { color: "#77756F", fontSize: 12 },
  empty: { color: "#77756F", padding: 16 },
});
