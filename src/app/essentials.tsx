
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useParkourTheme } from "@/contexts/parkour-theme";

const LIGHT_COLORS = {
  background: "#F8FAF8",
  text: "#344238",
  gold: "#D4AF37",
  card: "#FFFFFF",
  muted: "#77756F",
  border: "#E1E7E1",
  notice: "#F0EBE2",
};

const DARK_COLORS = {
  background: "#101827",
  text: "#FFFFFF",
  gold: "#D4AF37",
  card: "#202B3C",
  muted: "#AAB4C4",
  border: "#354358",
  notice: "#283445",
};

const resources = [
  {
    title: "Parking Permits",
    description:
      "Find information about student and employee parking permits.",
    icon: "card-outline" as const,
    url: "https://parking.ucf.edu/",
  },
  {
    title: "Parking Rules",
    description:
      "Review official UCF parking regulations and restrictions.",
    icon: "document-text-outline" as const,
    url: "https://parking.ucf.edu/",
  },
  {
    title: "Parking Services",
    description:
      "Visit UCF Parking and Transportation Services for assistance.",
    icon: "help-circle-outline" as const,
    url: "https://parking.ucf.edu/",
  },
];

export default function EssentialsScreen() {
  const router = useRouter();
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  async function openResource(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open",
        "Please try again later."
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={26}
            color={COLORS.text}
          />
        </TouchableOpacity>

        {/* HEADER */}
        <Text style={styles.title}>
          Parking essentials
        </Text>

        <Text style={styles.subtitle}>
          Everything you need to know before parking
          at UCF.
        </Text>

        {/* RESOURCE CARDS */}
        {resources.map((resource) => (
          <TouchableOpacity
            key={resource.title}
            style={styles.card}
            onPress={() => openResource(resource.url)}
            accessibilityRole="link"
            accessibilityLabel={resource.title}
          >
            <View style={styles.row}>
              <Ionicons
                name={resource.icon}
                size={28}
                color={COLORS.gold}
              />

              <Ionicons
                name="open-outline"
                size={20}
                color={COLORS.muted}
              />
            </View>

            <Text style={styles.heading}>
              {resource.title}
            </Text>

            <Text style={styles.description}>
              {resource.description}
            </Text>
          </TouchableOpacity>
        ))}

        {/* INFORMATION NOTICE */}
        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={COLORS.gold}
          />

          <Text style={styles.description}>
            Always follow posted signs and official UCF
            parking regulations. Rules and permit
            requirements may change.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(COLORS: typeof LIGHT_COLORS) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    content: {
      padding: 24,
      gap: 18,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      color: COLORS.text,
    },

    subtitle: {
      fontSize: 15,
      lineHeight: 23,
      color: COLORS.muted,
      marginBottom: 8,
    },

    card: {
      backgroundColor: COLORS.card,
      padding: 22,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: 12,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    heading: {
      fontSize: 19,
      fontWeight: "700",
      color: COLORS.text,
    },

    description: {
      fontSize: 14,
      lineHeight: 22,
      color: COLORS.muted,
      flexShrink: 1,
    },

    notice: {
      backgroundColor: COLORS.notice,
      borderRadius: 12,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
  });
}
