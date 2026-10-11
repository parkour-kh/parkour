
import React from "react";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
  type TabListProps,
} from "expo-router/ui";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useParkourTheme } from "@/contexts/parkour-theme";

const LIGHT_COLORS = {
  background: "#FFFFFF",
  text: "#77756F",
  selectedText: "#344238",
  border: "#E1E7E1",
  selected: "#F4F1E5",
  gold: "#D4AF37",
};

const DARK_COLORS = {
  background: "#182335",
  text: "#AAB4C4",
  selectedText: "#FFFFFF",
  border: "#354358",
  selected: "#394151",
  gold: "#D4AF37",
};

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.tabSlot} />

      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home-outline">
              Home
            </TabButton>
          </TabTrigger>

          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton icon="map-outline">
              Explore
            </TabButton>
          </TabTrigger>

          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton icon="settings-outline">
              Settings
            </TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
};

export function TabButton({
  children,
  isFocused,
  icon = "ellipse-outline",
  ...props
}: TabButtonProps) {
  const { isDark } = useParkourTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.tabButton,
        {
          backgroundColor: isFocused
            ? COLORS.selected
            : "transparent",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={21}
        color={
          isFocused ? COLORS.selectedText : COLORS.text
        }
      />

      <Text
        style={[
          styles.tabText,
          {
            color: isFocused
              ? COLORS.selectedText
              : COLORS.text,
            fontWeight: isFocused ? "700" : "500",
          },
        ]}
      >
        {children}
      </Text>

      {isFocused && (
        <View
          style={[
            styles.activeIndicator,
            { backgroundColor: COLORS.gold },
          ]}
        />
      )}
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { isDark } = useParkourTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <View
      {...props}
      style={[
        styles.tabListContainer,
        {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
        },
      ]}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  tabSlot: {
    flex: 1,
    height: "100%",
  },

  tabListContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: "100%",
  },

  tabButton: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },

  tabText: {
    fontSize: 12,
  },

  activeIndicator: {
    position: "absolute",
    bottom: 2,
    width: 18,
    height: 3,
    borderRadius: 3,
  },
});
