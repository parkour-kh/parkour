export type Permit = "Student" | "Employee";

export type Garage = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  available: number;
  capacity: number;
  permits: Permit[];
};

export const DESTINATIONS: Record<
  string,
  { name: string; latitude: number; longitude: number }
> = {
  library: {
    name: "John C. Hitt Library",
    latitude: 28.6005,
    longitude: -81.2004,
  },
  "student-union": {
    name: "Student Union",
    latitude: 28.6017,
    longitude: -81.2002,
  },
  engineering: {
    name: "Engineering Building",
    latitude: 28.6014,
    longitude: -81.1984,
  },
  cb1: {
    name: "Classroom Building I",
    latitude: 28.6002,
    longitude: -81.1991,
  },
  cb2: {
    name: "Classroom Building II",
    latitude: 28.5998,
    longitude: -81.1986,
  },
  arena: {
    name: "Addition Financial Arena",
    latitude: 28.6071,
    longitude: -81.1972,
  },
};

// Approximate demo markers. Verify actual garage entrances
// before using them for navigation.
export const GARAGES: Garage[] = [
  {
    id: "a",
    name: "Garage A",
    latitude: 28.6000,
    longitude: -81.2034,
    available: 35,
    capacity: 120,
    permits: ["Student", "Employee"],
  },
  {
    id: "b",
    name: "Garage B",
    latitude: 28.6030,
    longitude: -81.2025,
    available: 18,
    capacity: 150,
    permits: ["Student", "Employee"],
  },
  {
    id: "c",
    name: "Garage C",
    latitude: 28.6042,
    longitude: -81.1988,
    available: 42,
    capacity: 180,
    permits: ["Student", "Employee"],
  },
  {
    id: "d",
    name: "Garage D",
    latitude: 28.5990,
    longitude: -81.1975,
    available: 24,
    capacity: 100,
    permits: ["Employee"],
  },
];

