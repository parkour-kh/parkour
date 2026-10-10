
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CampusDestinationSearch, { SelectedPlace } from "../components/CampusDestinationSearch";

const COLORS = {
  background: "#F8FAF8",
  text: "#242424",
  muted: "#77756F",
  gold: "#D4AF37",
  card: "#F3F6F3",
  beige: "#F0EBE2",
  white: "#FFFFFF",
  green: "#344238",
};

export default function HomeScreen() {
  const router = useRouter();

  const [permit, setPermit] = useState<"Student" | "Employee">("Student");

  function selectGooglePlace(place: SelectedPlace) {
    Keyboard.dismiss();
    router.push({
      pathname: "/explore",
      params: {
        destinationName: place.name,
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        permit,
      },
    });
  }
  function showComingSoon(feature: string) {
    Alert.alert(
      feature,
      "We're working on this feature for Parkour!"
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            parkour<Text style={styles.logoDot}>.</Text>
          </Text>
          <Text style={styles.tagline}>find your space.</Text>
        </View>

        {/* UCF HERO IMAGE */}
        <ImageBackground
          source={require("../../assets/images/millican-hall.jpg")}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />

          <Text style={styles.heroTitle}>
            Find your parking spot
          </Text>
          <Text style={styles.heroSubtitle}>
            see available spots near you.
          </Text>

          <TouchableOpacity
            style={styles.heroArrow}
            onPress={() => Alert.alert("Search for a destination", "Type a location into the Google-powered search bar below and choose a suggestion.")}
          >
            <Ionicons
              name="arrow-forward"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </ImageBackground>

        {/* DESTINATION SEARCH */}
        <View style={styles.destinationSection}>
          <Text style={styles.sectionTitle}>Where are we going?</Text>
          <Text style={styles.sectionSubtitle}>Less searching. More getting there.</Text>
          <CampusDestinationSearch onSelect={selectGooglePlace} />
        </View>

        {/* PERMIT SELECTOR */}
        <View style={styles.permitSection}>
          <Text style={styles.permitLabel}>
            Your parking permit
          </Text>

          <View style={styles.permitRow}>
            {(["Student", "Employee"] as const).map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.permitButton,
                    permit === type && styles.permitSelected,
                  ]}
                  onPress={() => setPermit(type)}
                >
                  <Ionicons
                    name={
                      type === "Student"
                        ? "school-outline"
                        : "briefcase-outline"
                    }
                    size={19}
                    color={COLORS.text}
                  />

                  <Text style={styles.permitText}>
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        {/* PARKING JOURNEY */}
        <View style={styles.journeySection}>
          <Text style={styles.journeyTitle}>
            Your parking journey
          </Text>

          {[
            {
              title: "Already parked?",
              icon: "car-outline" as const,
            },
            {
              title: "Parking essentials",
              icon: "clipboard-outline" as const,
            },
            {
              title: "Need assistance?",
              icon: "chatbubble-outline" as const,
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.journeyCard}
              onPress={() => showComingSoon(item.title)}
            >
              <Ionicons
                name={item.icon}
                size={21}
                color={COLORS.gold}
              />

              <Text style={styles.journeyText}>
                {item.title}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.muted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* GOOD TO KNOW */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsHeader}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color={COLORS.gold}
            />

            <Text style={styles.tipsTitle}>
              Good to know
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              Parking regulations can vary by permit,
              location, and time. Always check current
              UCF Parking and Transportation rules
              before choosing a space.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -1,
  },
  logoDot: {
    color: COLORS.gold,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  hero: {
    height: 160,
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.green,
  },
  heroImage: {
    borderRadius: 18,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.32)",
    borderRadius: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 6,
    zIndex: 2,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.white,
    zIndex: 2,
  },
  heroArrow: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  destinationSection: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 20,
  },
  searchBox: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D9D4C3",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 54,
    fontSize: 16,
    color: COLORS.text,
  },
  suggestionList: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E0",
    marginTop: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0ED",
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },
  noResults: {
    padding: 18,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },
  permitSection: {
    marginBottom: 24,
  },
  permitLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: 10,
  },
  permitRow: {
    flexDirection: "row",
    gap: 10,
  },
  permitButton: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E7E1",
    backgroundColor: COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  permitSelected: {
    borderColor: COLORS.gold,
    borderWidth: 2,
    backgroundColor: "#F4F1E5",
  },
  permitText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  journeySection: {
    marginBottom: 23,
  },
  journeyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 14,
  },
  journeyCard: {
    height: 44,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 11,
  },
  journeyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  tipsSection: {
    marginBottom: 12,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  tipCard: {
    backgroundColor: COLORS.beige,
    borderRadius: 12,
    padding: 16,
    minHeight: 86,
    justifyContent: "center",
  },
  tipText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#55534F",
  },
});
