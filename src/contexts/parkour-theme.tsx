
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Appearance = "light" | "dark";

type ThemeContextType = {
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
  isDark: boolean;
};

const STORAGE_KEY = "parkour-appearance";

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ParkourThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appearance, updateAppearance] = useState<Appearance>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadPreference() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved === "light" || saved === "dark") {
          updateAppearance(saved);
        }
      } catch (error) {
        console.warn("Could not load appearance preference", error);
      } finally {
        setReady(true);
      }
    }

    loadPreference();
  }, []);

  function setAppearance(value: Appearance) {
    updateAppearance(value);

    AsyncStorage.setItem(STORAGE_KEY, value).catch((error) => {
      console.warn("Could not save appearance preference", error);
    });
  }

  return (
    <ThemeContext.Provider
      value={{
        appearance,
        setAppearance,
        isDark: appearance === "dark",
      }}
    >
      {ready ? children : null}
    </ThemeContext.Provider>
  );
}

export function useParkourTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useParkourTheme must be used inside ParkourThemeProvider"
    );
  }

  return context;
}
