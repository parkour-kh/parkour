
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useParkourTheme } from "@/contexts/parkour-theme";

export type SelectedPlace = {
  place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type Prediction = {
  place_id: string;
  name: string;
  address: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

const destinations: SelectedPlace[] = [
  {
    place_id: "library",
    name: "John C. Hitt Library",
    address: "UCF Main Campus",
    latitude: 28.6004,
    longitude: -81.2001,
  },
  {
    place_id: "union",
    name: "Student Union",
    address: "UCF Main Campus",
    latitude: 28.6010,
    longitude: -81.2004,
  },
  {
    place_id: "millican",
    name: "Millican Hall",
    address: "UCF Main Campus",
    latitude: 28.5991,
    longitude: -81.2008,
  },
  {
    place_id: "arena",
    name: "Addition Financial Arena",
    address: "UCF Main Campus",
    latitude: 28.6072,
    longitude: -81.1973,
  },
  {
    place_id: "engineering",
    name: "Engineering Building",
    address: "UCF Main Campus",
    latitude: 28.6017,
    longitude: -81.1988,
  },
  {
    place_id: "rec",
    name: "Recreation and Wellness Center",
    address: "UCF Main Campus",
    latitude: 28.5965,
    longitude: -81.1987,
  },
];

const LIGHT_COLORS = {
  background: "#FFFFFF",
  text: "#242424",
  muted: "#77756F",
  border: "#D9D4C3",
  divider: "#EEEEEE",
  resultsBorder: "#E5E5E0",
  resultBackground: "#FFFFFF",
  footer: "#F5F7FC",
  footerText: "#5F6368",
  gold: "#D4AF37",
  google: "#4B6CB7",
};

const DARK_COLORS = {
  background: "#202B3C",
  text: "#FFFFFF",
  muted: "#AAB4C4",
  border: "#354358",
  divider: "#354358",
  resultsBorder: "#354358",
  resultBackground: "#202B3C",
  footer: "#182335",
  footerText: "#C1CBD9",
  gold: "#D4AF37",
  google: "#91B6FF",
};

function newSessionToken() {
  return (
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

async function post(path: string, payload: object) {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${API_URL}/api/places/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export default function CampusDestinationSearch({
  onSelect,
}: {
  onSelect: (place: SelectedPlace) => void;
}) {
  const { isDark } = useParkourTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const sessionToken = useRef(newSessionToken());

  const trimmed = query.trim();

  const matches =
    trimmed.length > 0
      ? destinations.filter((destination) =>
          (
            destination.name +
            " " +
            destination.address +
            " " +
            destination.place_id
          )
            .toLowerCase()
            .includes(trimmed.toLowerCase())
        )
      : [];

  // Request Google suggestions after 300 ms of inactivity.
  useEffect(() => {
    if (!API_URL || trimmed.length < 2) {
      setPredictions([]);
      setFailed(false);
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await post("autocomplete", {
          query: trimmed,
          session_token: sessionToken.current,
        });

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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  function choose(place: SelectedPlace) {
    setQuery(place.name);
    setFocused(false);
    setPredictions([]);
    onSelect(place);
  }

  async function choosePrediction(prediction: Prediction) {
    setLoading(true);

    try {
      const details = await post("details", {
        place_id: prediction.place_id,
        session_token: sessionToken.current,
      });

      sessionToken.current = newSessionToken();

      choose({
        place_id: details.place_id,
        name: details.name,
        address: details.address,
        latitude: details.latitude,
        longitude: details.longitude,
      });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit() {
    if (matches.length > 0) {
      choose(matches[0]);
    } else if (predictions.length > 0) {
      void choosePrediction(predictions[0]);
    }
  }

  return (
    <View>
      {/* SEARCH INPUT */}
      <View style={styles.search}>
        <Ionicons
          name="search-outline"
          size={21}
          color={COLORS.muted}
        />

        <TextInput
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setFailed(false);
          }}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          placeholder="Search UCF destinations"
          placeholderTextColor={COLORS.muted}
          selectionColor={COLORS.gold}
          style={styles.input}
          accessibilityLabel="Search UCF destinations"
        />

        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.google}
          />
        )}
      </View>

      {/* SEARCH RESULTS */}
      {focused && trimmed.length > 0 && (
        <View style={styles.results}>
          {matches.map((destination) => (
            <TouchableOpacity
              key={destination.place_id}
              style={styles.result}
              onPress={() => choose(destination)}
              accessibilityRole="button"
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={COLORS.gold}
              />

              <View style={styles.aiText}>
                <Text style={styles.name}>
                  {destination.name}
                </Text>
                <Text style={styles.subtitle}>
                  {destination.address}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {predictions.map((prediction) => (
            <TouchableOpacity
              key={prediction.place_id}
              style={styles.result}
              onPress={() =>
                void choosePrediction(prediction)
              }
              accessibilityRole="button"
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={COLORS.google}
              />

              <View style={styles.aiText}>
                <Text style={styles.name}>
                  {prediction.name}
                </Text>

                {prediction.address ? (
                  <Text style={styles.subtitle}>
                    {prediction.address}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}

          {failed && (
            <View style={styles.result}>
              <Text style={styles.subtitle}>
                Google search is unavailable right now.
                Campus search still works.
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by Google
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function createStyles(COLORS: typeof LIGHT_COLORS) {
  return StyleSheet.create({
    search: {
      height: 54,
      backgroundColor: COLORS.background,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
    },

    input: {
      flex: 1,
      fontSize: 15,
      color: COLORS.text,
    },

    results: {
      backgroundColor: COLORS.resultBackground,
      marginTop: 7,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.resultsBorder,
      overflow: "hidden",
    },

    result: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.divider,
    },

    aiText: {
      flex: 1,
    },

    name: {
      fontWeight: "600",
      fontSize: 14,
      color: COLORS.text,
    },

    subtitle: {
      color: COLORS.muted,
      fontSize: 12,
      marginTop: 2,
    },

    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: COLORS.footer,
    },

    footerText: {
      color: COLORS.footerText,
      fontSize: 11,
      fontWeight: "600",
    },
  });
}
