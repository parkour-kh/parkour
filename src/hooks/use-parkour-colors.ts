
import { ParkourColors } from "@/constants/theme";
import { useParkourTheme } from "@/contexts/parkour-theme";

export function useParkourColors() {
  const { appearance, isDark } = useParkourTheme();

  return {
    colors: ParkourColors[appearance],
    isDark,
  };
}
