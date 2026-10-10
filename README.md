# Parkour — UCF parking prototype

Parkour is a hackathon prototype that recommends sample UCF parking garages based on a chosen campus destination and permit type, and displays a simulated garage-floor view.

## Project layout

- `mobile/`: Expo / React Native application
- `mobile/src/app/`: app screens
- `mobile/src/components/`: reusable UI components
- `mobile/src/data/parking.ts`: demo garage and destination information
- `backend/`: optional FastAPI Google Places prototype

## Run the mobile app

1. Install Node.js and run `cd mobile`.
2. Run `npm install`.
3. Run `npx expo start --clear --tunnel` (or `npx expo start` on the same network).
4. Open the project with Expo Go on a compatible phone.

## Optional backend

From `backend/`, create a Python virtual environment and run `pip install -r requirements.txt`. Set `GOOGLE_PLACES_API_KEY` in a local `.env` file (never commit it). Run `uvicorn main:app --reload`. The current mobile destination search uses local demo data and does not require the backend.

## Prototype limitations

Garage locations, permit rules, capacity, availability, and individual parking-space occupancy are sample values, **not live UCF parking information**. The garage detail screen has an independent 72-space simulation, so its count is not yet synchronized with the Explore overview. Directions currently highlight a garage on the map rather than providing turn-by-turn navigation. Verify real-world garage entrances and parking restrictions before any production use.
