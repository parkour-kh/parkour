
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { useParkourTheme } from "@/contexts/parkour-theme";

const resources = [
  {
    icon: "🎟️",
    title: "Parking Permits",
    description: "Purchase permits and manage your vehicles.",
    url: "https://secure.parking.ucf.edu/parkingportal/",
  },
  {
    icon: "📋",
    title: "Parking Rules",
    description: "Review official UCF parking regulations.",
    url: "https://regulations.ucf.edu/docs/chapter-06/",
  },
  {
    icon: "🎫",
    title: "Pay a Citation",
    description: "Look up and pay parking tickets.",
    url: "https://secure.parking.ucf.edu/parkingportal/Citations/CitationDefault.aspx",
  },
  {
    icon: "📝",
    title: "Appeal a Citation",
    description: "Learn how to dispute an eligible parking ticket.",
    url: "https://parking.ucf.edu/citations/appeal-a-citation/",
  },
  {
    icon: "🗺️",
    title: "Campus Parking Map",
    description: "Find parking garages, lots, and campus maps.",
    url: "https://parking.ucf.edu/resources/maps/",
  },
  {
    icon: "🚗",
    title: "Parking Assistance",
    description: "Contact UCF Parking Services for help.",
    url: "https://parking.ucf.edu/parking-and-transportation-services/contact/",
  },
];

async function openResource(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);

    if (!supported) {
      Alert.alert("Unable to open link", "Please try again later.");
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert("Something went wrong", "Could not open this resource.");
  }
}

export default function ParkingEssentials() {
  const { isDark } = useParkourTheme();
  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Parking Essentials",
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? "#101827" : "#F7F8FA",
          },
          headerTintColor: isDark ? "#FFFFFF" : "#172033",
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Parking Essentials</Text>

        <Text style={styles.subtitle}>
          Everything you need to know about parking at UCF, all in one place.
        </Text>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>💡 Quick Parking Tip</Text>
          <Text style={styles.noticeText}>
            UCF requires valid parking permits on weekends too.
            Always check posted signs and current university regulations.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Resources</Text>

        {resources.map((resource) => (
          <Pressable
            key={resource.title}
            accessibilityRole="link"
            accessibilityLabel={resource.title}
            accessibilityHint="Opens the official UCF website"
            onPress={() => openResource(resource.url)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.iconBox}>
              <Text style={styles.emoji}>{resource.icon}</Text>
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{resource.title}</Text>
              <Text style={styles.cardDescription}>
                {resource.description}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>
            Need immediate vehicle help?
          </Text>

          <Text style={styles.helpText}>
            UCF Police Motorist Assistance: 407-823-5555
          </Text>

          <Pressable
            onPress={() => openResource("tel:4078235555")}
            accessibilityRole="button"
            style={styles.callButton}
          >
            <Text style={styles.callButtonText}>
              Call Motorist Assistance
            </Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            For emergencies, call 911.
          </Text>
        </View>

        <Text style={styles.footer}>
          External resources are provided by UCF Parking and Transportation
          Services. Parkour is an independent student project.
        </Text>
      </ScrollView>
    </View>
  );
}

function createStyles(isDark: boolean) {
  const c = {
    background: isDark ? "#101827" : "#F7F8FA",
    card: isDark ? "#202B3C" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#172033",
    muted: isDark ? "#AAB4C4" : "#657084",
    border: isDark ? "#354358" : "#E8EBF0",
    notice: isDark ? "#473B22" : "#FFF5D6",
    noticeText: isDark ? "#FFE29A" : "#755100",
    iconBox: isDark ? "#354358" : "#F0F2F6",
    helpBox: isDark ? "#283445" : "#E9EEF8",
    helpText: isDark ? "#D1D9E6" : "#44516A",
    button: isDark ? "#D4AF37" : "#172033",
    buttonText: isDark ? "#242424" : "#FFFFFF",
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    content: {
      padding: 20,
      paddingBottom: 48,
    },

    heading: {
      fontSize: 28,
      fontWeight: "800",
      color: c.text,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
      marginBottom: 22,
    },

    notice: {
      backgroundColor: c.notice,
      borderRadius: 16,
      padding: 16,
      marginBottom: 26,
    },

    noticeTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: c.noticeText,
      marginBottom: 6,
    },

    noticeText: {
      fontSize: 13,
      lineHeight: 20,
      color: c.noticeText,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
      marginBottom: 14,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },

    pressed: {
      opacity: 0.7,
    },

    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 13,
      backgroundColor: c.iconBox,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },

    emoji: {
      fontSize: 23,
    },

    cardText: {
      flex: 1,
    },

    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
      marginBottom: 4,
    },

    cardDescription: {
      fontSize: 12,
      lineHeight: 18,
      color: c.muted,
    },

    arrow: {
      fontSize: 26,
      color: c.muted,
      marginLeft: 8,
    },

    helpBox: {
      backgroundColor: c.helpBox,
      borderRadius: 18,
      padding: 18,
      marginTop: 20,
    },

    helpTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: c.text,
      marginBottom: 8,
    },

    helpText: {
      fontSize: 14,
      color: c.helpText,
      marginBottom: 14,
    },

    callButton: {
      backgroundColor: c.button,
      padding: 14,
      borderRadius: 12,
      alignItems: "center",
    },

    callButtonText: {
      color: c.buttonText,
      fontWeight: "700",
    },

    disclaimer: {
      color: c.muted,
      fontSize: 12,
      marginTop: 12,
    },

    footer: {
      fontSize: 11,
      color: c.muted,
      textAlign: "center",
      marginTop: 24,
      lineHeight: 17,
    },
  });
}
