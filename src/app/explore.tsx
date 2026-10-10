import GarageScreen from "./garage";
import { getGarages } from "../constants/api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { DESTINATIONS, GARAGES, type Garage, type Permit } from "../data/parking";

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
        name: typeof params.destinationName === "string"
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
  const [onlineGarages, setOnlineGarages] = useState<
  Record<string, number>
>({});

const [onlineStatus, setOnlineStatus] = useState<
  "loading" | "connected" | "error"
>("loading");

useEffect(() => {
  let active = true;

  async function loadOnlineGarages() {
    try {
      const garages: {
        id: string;
        name: string;
        available: number;
        total: number;
      }[] = await getGarages();

      if (!active) return;

      const counts: Record<string, number> = {};

      garages.forEach((garage) => {
        counts[garage.id.toLowerCase()] = garage.available;
      });

      setOnlineGarages(counts);
      setOnlineStatus("connected");
    } catch (error) {
      console.error("Failed to load online garages:", error);
      if (active) setOnlineStatus("error");
    }
  }

  loadOnlineGarages();

  return () => {
    active = false;
  };
}, []);
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
  simulateFull && garage.id.toLowerCase() === "b"
    ? 0
    : onlineStatus === "connected" &&
        Object.prototype.hasOwnProperty.call(
          onlineGarages,
          garage.id.toLowerCase()
        )
      ? onlineGarages[garage.id.toLowerCase()]
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
  }, [destination.latitude, destination.longitude, permit, simulateFull]);

  const bestGarage = rankedGarages.find(
    (garage) => garage.available > 0
  );

  const selectedGarage =
    rankedGarages.find(
      (garage) => garage.id === selectedGarageId
    ) || bestGarage;

  useEffect(() => {
    setSelectedGarageId(null);
  }, [
  destination.latitude,
  destination.longitude,
  permit,
  simulateFull,
  onlineGarages,
  onlineStatus,
]);

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
          style={{
            backgroundColor: "#344238",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
            Back to recommendations
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <GarageScreen garageName={selectedGarage?.name ?? "Garage A"} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#242424"
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
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
        >
          {loadingLocation ? (
            <ActivityIndicator color="#344238" />
          ) : (
            <Ionicons
              name="locate-outline"
              size={25}
              color="#344238"
            />
          )}
        </TouchableOpacity>
      </View>

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
        >
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title={destination.name}
            pinColor="#D4AF37"
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

      <ScrollView
        style={styles.bottomPanel}
        contentContainerStyle={styles.bottomContent}
      >
      <Text
  style={{
    color: onlineStatus === "connected" ? "#344238" : "#82661F",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  }}
>
  {onlineStatus === "loading"
    ? "Connecting to Parkour server..."
    : onlineStatus === "connected"
      ? "Connected to Parkour online demo"
      : "Server unavailable — showing local demo estimates"}
</Text>
        <View style={styles.demoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#82661F"
          />
          <Text style={styles.demoText}>
            Real map geography. Garage locations,
            permit rules and availability are demo data.
          </Text>
        </View>

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
                <Text style={styles.permitText}>
                  {type}
                </Text>
              </TouchableOpacity>
            )
          )}
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
            >
              <Ionicons
                name="navigate"
                size={18}
                color="#242424"
              />
              <Text style={styles.directionsText}>
                Get directions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowGarageDetails(true)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 10,
                padding: 14,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#344238", fontWeight: "800" }}>
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
          >
            <Ionicons
              name="business-outline"
              size={22}
              color="#344238"
            />

            <View style={{ flex: 1 }}>
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
              color="#77756F"
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.simulateButton}
          onPress={() => setSimulateFull(!simulateFull)}
        >
          <Ionicons
            name="flask-outline"
            size={19}
            color="#344238"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#242424",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#77756F",
    marginTop: 3,
  },
  mapContainer: {
    height: "43%",
    position: "relative",
    backgroundColor: "#E6ECE8",
  },
  mapLegend: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#242424",
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
    backgroundColor: "#F6F0DE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  demoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#82661F",
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
    backgroundColor: "#F0F3F0",
    borderWidth: 1,
    borderColor: "#E1E7E1",
    alignItems: "center",
  },
  permitSelected: {
    borderColor: "#D4AF37",
    backgroundColor: "#F4F1E5",
    borderWidth: 2,
  },
  permitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#242424",
  },
  recommendationCard: {
    backgroundColor: "#344238",
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },
  recommendationHeader: {
    marginBottom: 15,
  },
  recommendationLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#D4AF37",
    marginBottom: 10,
  },
  garageTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 9,
  },
  garageDetails: {
    fontSize: 13,
    color: "#E2E8E2",
    marginBottom: 5,
  },
  directionsButton: {
    backgroundColor: "#D4AF37",
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
    color: "#242424",
  },
  noGarages: {
    fontSize: 14,
    color: "#77756F",
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#242424",
    marginBottom: 12,
  },
  garageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#E8E8E5",
  },
  garageName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#242424",
  },
  garageMeta: {
    fontSize: 12,
    color: "#77756F",
    marginTop: 4,
  },
  simulateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#D4AF37",
    borderRadius: 12,
    padding: 15,
    marginTop: 14,
  },
  simulateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344238",
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 18,
    color: "#77756F",
    marginTop: 18,
  },
});
