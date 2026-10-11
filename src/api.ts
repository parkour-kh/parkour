// Read-only helpers for the Parkour backend (Flask). The app only READS spot data;
// spot updates come from the sensor, camera and simulator, which hold the SENSOR_TOKEN.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

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

// GET /api/garages -> every garage with open/taken counts
export function getGarages() {
  return get<unknown[]>("/api/garages");
}

// GET /api/garages/<id> -> one garage's floors and every spot
export function getGarage(id: string) {
  return get<{ garage: string; floors: ApiFloor[] }>(`/api/garages/${id}`);
}
