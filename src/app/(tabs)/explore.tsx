
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import GarageScreen from "./garage";
import {
  DESTINATIONS,
  GARAGES,
  type Garage,
  type Permit,
} from "../../data/parking";
import { useParkourTheme } from "@/contexts/parkour-theme";

const LIGHT_COLORS = {
  background: "#F8FAF8",
  surface: "#FFFFFF",
  text: "#242424",
  muted: "#77756F",
  border: "#E8E8E5",
  green: "#344238",
  gold: "#D4AF37",
  card: "#F0F3F0",
  selected: "#F4F1E5",
  mapBackground: "#E6ECE8",
  notice: "#F6F0DE",
  noticeText: "#82661F",
  recommendation: "#344238",
  recommendationText: "#FFFFFF",
  recommendationMuted: "#E2E8E2",
  buttonText: "#242424",
  detailButton: "#FFFFFF",
  detailButtonText: "#344238",
};

const DARK_COLORS = {
  background: "#101827",
  surface: "#182335",
  text: "#FFFFFF",
  muted: "#AAB4C4",
  border: "#354358",
  green: "#D4AF37",
  gold: "#D4AF37",
  card: "#202B3C",
  selected: "#394151",
  mapBackground: "#182335",
  notice: "#473B22",
  noticeText: "#FFE29A",
  recommendation: "#202B3C",
  recommendationText: "#FFFFFF",
  recommendationMuted: "#D1D9E6",
  buttonText: "#242424",
  detailButton: "#394151",
  detailButtonText: "#FFFFFF",
};

const DARK_MAP_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#202B3C" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#B8C3D3" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#182335" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#354358" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#202B3C" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#111D30" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263D35" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#283445" }],
  },
];

function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) ** 2;

  return (
    6371000 *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const params = useLocalSearchParams<{
    destination?: string;
    destinationName?: string;
    latitude?: string;
    longitude?: string;
    permit?: string;
  }>();

  const destinationId =
    typeof params.destination === "string" &&
    DESTINATIONS[params.destination]
      ? params.destination
      : "library";

  const passedLatitude = Number(params.latitude);
  const passedLongitude = Number(params.longitude);

  const hasPassedCoordinates =
    typeof params.latitude === "string" &&
    typeof params.longitude === "string" &&
    Number.isFinite(passedLatitude) &&
    Number.isFinite(passedLongitude);

  const destination = hasPassedCoordinates
    ? {
        name:
          typeof params.destinationName === "string"
            ? params.destinationName
            : "Selected destination",
        latitude: passedLatitude,
        longitude: passedLongitude,
      }
    : DESTINATIONS[destinationId];

  const [permit, setPermit] = useState<Permit>(
    params.permit === "Employee" ? "Employee" : "Student"
  );

  const [selectedGarageId, setSelectedGarageId] =
    useState<string | null>(null);

  const [simulateFull, setSimulateFull] = useState(false);
  const [showGarageDetails, setShowGarageDetails] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] =
    useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const rankedGarages = useMemo(() => {
    return GARAGES.filter((garage) =>
      garage.permits.includes(permit)
    )
      .map((garage) => ({
        ...garage,
        available:
          simulateFull && garage.id === "b"
            ? 0
            : garage.available,
        distance: distanceMeters(
          garage.latitude,
          garage.longitude,
          destination.latitude,
          destination.longitude
        ),
      }))
      .sort((a, b) => {
        if ((a.available > 0) !== (b.available > 0)) {
          return a.available > 0 ? -1 : 1;
        }
        return a.distance - b.distance;
      });
  }, [
    destination.latitude,
    destination.longitude,
    permit,
    simulateFull,
  ]);

  const bestGarage = rankedGarages.find(
    (garage) => garage.available > 0
  );

  const selectedGarage =
    rankedGarages.find(
      (garage) => garage.id === selectedGarageId
    ) || bestGarage;

  useEffect(() => {
    setSelectedGarageId(null);
  }, [destination.latitude, destination.longitude, permit]);

  async function showMyLocation() {
    try {
      setLoadingLocation(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission",
          "Allow location access to see yourself on the map."
        );
        return;
      }

      setHasLocationPermission(true);

      const position =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      mapRef.current?.animateToRegion(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        },
        600
      );
    } catch {
      Alert.alert(
        "Location unavailable",
        "We couldn't determine your current location."
      );
    } finally {
      setLoadingLocation(false);
    }
  }

  function focusGarage(garage: Garage) {
    setSelectedGarageId(garage.id);

    mapRef.current?.animateToRegion(
      {
        latitude: garage.latitude,
        longitude: garage.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      },
      500
    );
  }

  function openDirections(garage: Garage) {
    focusGarage(garage);

    Alert.alert(
      "Garage located",
      "The garage is highlighted on Parkour's map. Turn-by-turn directions are not available yet."
    );
  }

  const initialRegion = {
    latitude: destination.latitude,
    longitude: destination.longitude,
    latitudeDelta: 0.025,
    longitudeDelta: 0.025,
  };

  if (showGarageDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={() => setShowGarageDetails(false)}
          style={styles.detailsBack}
          accessibilityRole="button"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={COLORS.recommendationText}
          />
          <Text style={styles.detailsBackText}>
            Back to recommendations
          </Text>
        </TouchableOpacity>

        <View style={styles.flex}>
          <GarageScreen
            garageName={selectedGarage?.name ?? "Garage A"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.flex}>
          <Text style={styles.headerTitle}>
            Explore parking
          </Text>
          <Text style={styles.headerSubtitle}>
            {destination.name}
          </Text>
        </View>

        <TouchableOpacity
          onPress={showMyLocation}
          disabled={loadingLocation}
          accessibilityRole="button"
          accessibilityLabel="Show my location"
        >
          {loadingLocation ? (
            <ActivityIndicator color={COLORS.green} />
          ) : (
            <Ionicons
              name="locate-outline"
              size={25}
              color={COLORS.green}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation={hasLocationPermission}
          showsCompass
          showsScale
          showsBuildings
          customMapStyle={isDark ? DARK_MAP_STYLE : []}
        >
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title={destination.name}
            pinColor={COLORS.gold}
          />

          {rankedGarages.map((garage) => (
            <Marker
              key={garage.id}
              coordinate={{
                latitude: garage.latitude,
                longitude: garage.longitude,
              }}
              title={garage.name}
              description={
                garage.available === 0
                  ? "Full (demo)"
                  : `${garage.available} spaces available (demo)`
              }
              pinColor={
                garage.available === 0
                  ? "#8B8B8B"
                  : garage.id === bestGarage?.id
                    ? "#D4AF37"
                    : "#39A86B"
              }
              onPress={() => setSelectedGarageId(garage.id)}
            />
          ))}
        </MapView>

        <View style={styles.mapLegend}>
          <Text style={styles.legendText}>
            🟡 Recommended / destination
          </Text>
          <Text style={styles.legendText}>
            🟢 Available (demo)
          </Text>
          <Text style={styles.legendText}>
            ⚪ Full (demo)
          </Text>
        </View>
      </View>

      {/* RECOMMENDATIONS */}
      <ScrollView
        style={styles.bottomPanel}
        contentContainerStyle={styles.bottomContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.demoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={COLORS.noticeText}
          />
          <Text style={styles.demoText}>
            Real map geography. Garage locations,
            permit rules and availability are demo data.
          </Text>
        </View>

        <View style={styles.permitRow}>
          {(["Student", "Employee"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.permitButton,
                permit === type && styles.permitSelected,
              ]}
              onPress={() => setPermit(type)}
              accessibilityRole="button"
              accessibilityState={{
                selected: permit === type,
              }}
            >
              <Text style={styles.permitText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedGarage ? (
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationLabel}>
                {selectedGarage.id === bestGarage?.id
                  ? "BEST AVAILABLE OPTION"
                  : "SELECTED GARAGE"}
              </Text>

              <Text style={styles.garageTitle}>
                {selectedGarage.name}
              </Text>

              <Text style={styles.garageDetails}>
                {selectedGarage.available === 0
                  ? "Full in demo"
                  : `${selectedGarage.available} sample spaces open`}
              </Text>

              <Text style={styles.garageDetails}>
                Approximately{" "}
                {Math.round(selectedGarage.distance)} m
                straight-line distance from destination
              </Text>
            </View>

            <TouchableOpacity
              style={styles.directionsButton}
              onPress={() => openDirections(selectedGarage)}
              accessibilityRole="button"
            >
              <Ionicons
                name="navigate"
                size={18}
                color={COLORS.buttonText}
              />
              <Text style={styles.directionsText}>
                Get directions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowGarageDetails(true)}
              style={styles.viewSpacesButton}
              accessibilityRole="button"
            >
              <Text style={styles.viewSpacesText}>
                View available parking spaces
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noGarages}>
            No available demo garages for this permit.
          </Text>
        )}

        <Text style={styles.sectionTitle}>
          Nearby garages
        </Text>

        {rankedGarages.map((garage) => (
          <TouchableOpacity
            key={garage.id}
            style={styles.garageRow}
            onPress={() => focusGarage(garage)}
            accessibilityRole="button"
          >
            <Ionicons
              name="business-outline"
              size={22}
              color={COLORS.green}
            />

            <View style={styles.flex}>
              <Text style={styles.garageName}>
                {garage.name}
              </Text>

              <Text style={styles.garageMeta}>
                {garage.available === 0
                  ? "Full"
                  : `${garage.available} open (demo)`}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.muted}
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.simulateButton}
          onPress={() => setSimulateFull(!simulateFull)}
          accessibilityRole="button"
        >
          <Ionicons
            name="flask-outline"
            size={19}
            color={COLORS.green}
          />
          <Text style={styles.simulateText}>
            {simulateFull
              ? "Reset garage availability"
              : "Simulate Garage B becoming full"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Demo recommendations are not verified
          parking guidance. Confirm official UCF
          garage locations, entrances, permits and
          restrictions before relying on them.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(COLORS: typeof LIGHT_COLORS) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    detailsBack: {
      backgroundColor: COLORS.recommendation,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    detailsBackText: {
      color: COLORS.recommendationText,
      fontWeight: "700",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: COLORS.surface,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: COLORS.muted,
      marginTop: 3,
    },
    mapContainer: {
      height: "43%",
      position: "relative",
      backgroundColor: COLORS.mapBackground,
    },
    mapLegend: {
      position: "absolute",
      top: 12,
      left: 12,
      backgroundColor: COLORS.surface,
      borderRadius: 10,
      padding: 10,
      gap: 4,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    legendText: {
      fontSize: 11,
      color: COLORS.text,
    },
    bottomPanel: {
      flex: 1,
    },
    bottomContent: {
      padding: 18,
      paddingBottom: 50,
    },
    demoBanner: {
      flexDirection: "row",
      gap: 9,
      backgroundColor: COLORS.notice,
      padding: 12,
      borderRadius: 12,
      marginBottom: 15,
    },
    demoText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: COLORS.noticeText,
    },
    permitRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 15,
    },
    permitButton: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: "center",
    },
    permitSelected: {
      borderColor: COLORS.gold,
      backgroundColor: COLORS.selected,
      borderWidth: 2,
    },
    permitText: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.text,
    },
    recommendationCard: {
      backgroundColor: COLORS.recommendation,
      borderRadius: 16,
      padding: 18,
      marginBottom: 22,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    recommendationHeader: {
      marginBottom: 15,
    },
    recommendationLabel: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
      color: COLORS.gold,
      marginBottom: 10,
    },
    garageTitle: {
      fontSize: 25,
      fontWeight: "800",
      color: COLORS.recommendationText,
      marginBottom: 9,
    },
    garageDetails: {
      fontSize: 13,
      color: COLORS.recommendationMuted,
      marginBottom: 5,
    },
    directionsButton: {
      backgroundColor: COLORS.gold,
      padding: 13,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    directionsText: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.buttonText,
    },
    viewSpacesButton: {
      backgroundColor: COLORS.detailButton,
      borderRadius: 10,
      padding: 14,
      alignItems: "center",
      marginTop: 10,
    },
    viewSpacesText: {
      color: COLORS.detailButtonText,
      fontWeight: "800",
    },
    noGarages: {
      fontSize: 14,
      color: COLORS.muted,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.text,
      marginBottom: 12,
    },
    garageRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 15,
      backgroundColor: COLORS.surface,
      borderRadius: 12,
      marginBottom: 9,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    garageName: {
      fontSize: 15,
      fontWeight: "700",
      color: COLORS.text,
    },
    garageMeta: {
      fontSize: 12,
      color: COLORS.muted,
      marginTop: 4,
    },
    simulateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 12,
      padding: 15,
      marginTop: 14,
    },
    simulateText: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.green,
    },
    disclaimer: {
      fontSize: 11,
      lineHeight: 18,
      color: COLORS.muted,
      marginTop: 18,
    },
  });
}
