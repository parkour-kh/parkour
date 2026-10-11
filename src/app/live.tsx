import GarageScreen from "./(tabs)/garage";

// Standalone page for the website (/live): Garage A's spots straight from the backend.
// No map or GPS, so it works in any browser; the Explore tab can't on the web.
export default function Live() {
  return <GarageScreen garageName="Garage A" garageId="a" />;
}
