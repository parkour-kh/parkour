
export const API_BASE_URL = "https://parkour-api.onrender.com";

export type ParkingSpot = {
  id: string;
  status: "OPEN" | "TAKEN";
  narrow: boolean;
};

export type GarageFloors = Record<string, ParkingSpot[]>;

export async function getGarages() {
  const response = await fetch(`${API_BASE_URL}/api/garages`);

  if (!response.ok) {
    throw new Error("Failed to load garages");
  }

  return response.json();
}

export async function getGarageFloors(
  garageId: string
): Promise<GarageFloors> {
  const response = await fetch(
    `${API_BASE_URL}/api/garages/${encodeURIComponent(garageId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to load garage spaces");
  }

  const data = await response.json();
  return data.floors;
}
