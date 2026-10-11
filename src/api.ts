// Read-only helpers for the Parkour backend (Flask). The app only READS spot data;
// spot updates come from the sensor, camera and simulator, which hold the SENSOR_TOKEN.
const ENV_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

// When the site is opened over https (e.g. through a tunnel), call the API on the SAME
// address (nginx forwards /api to the backend). An https page can't call an http:// API.
const BASE_URL =
  typeof window !== "undefined" && window.location?.protocol === "https:" ? "" : ENV_URL;

export type ApiSpot = {
  id: string; // e.g. "a-1-03" = garage a, floor 1, space 03
  status: "OPEN" | "TAKEN";
};

export type ApiFloor = { floor: number; spots: ApiSpot[] };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`${path} failed: HTTP ${res.status}`);
  return res.json();
}

export type GarageSummary = {
  id: string;
  name: string;
  open: number;
  taken: number;
  capacity?: number;
  permits?: string[];
};

// GET /api/garages -> every garage with open/taken counts
export function getGarages() {
  return get<GarageSummary[]>("/api/garages");
}

// GET /api/garages/<id> -> one garage's floors and every spot
export function getGarage(id: string) {
  return get<{ garage: string; floors: ApiFloor[] }>(`/api/garages/${id}`);
}
