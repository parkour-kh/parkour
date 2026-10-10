# Parkour 🚗

**Find your space.** Parkour is a UCF student parking app prototype built for a hackathon. The goal is to help drivers choose an eligible garage near their destination, understand parking availability, and remember where they parked.

## Our project

- **Destination search:** Choose a UCF campus destination.
- **Permit-aware recommendations:** Compare sample garages for Student or Employee permits.
- **Garage and floor view:** Explore simulated individual parking spaces.
- **Save My Spot / Find My Car:** A planned end-to-end feature to remember a parked vehicle.
- **Camera occupancy detection:** Raspberry Pi / computer-vision prototype for identifying occupied spaces.
- **Entrance counter:** Arduino sensor prototype.
- **Directions:** Planned navigation to a garage and back to a parked vehicle.
- **Gemini parking assistant:** Planned in-app parking help and questions.
- **Reports:** Backend API endpoints for reporting parking issues.

## Run the phone app

Install Node.js and Expo Go. From the **repository root**, run:

```powershell
npm install
npx expo start --clear --tunnel
```

Scan the QR code with Expo Go. There is **no need to enter a separate `mobile` or `frontend` folder**.

## One project structure

- `src/app/` — Expo screens and navigation
- `src/components/` — reusable interface components
- `src/data/` — demo destinations and parking garages
- `assets/` — app images and icons
- `backend/` — Trevor's Flask API and Python server work
- `backend/camera/` — camera capture and computer-vision experiments
- `backend/dashboard/` — existing small entrance-count web demo
- `backend/experiments/` — optional Google Places FastAPI experiment (not connected to the mobile app)
- `hardware/` — Arduino entrance counter code

## What works today vs. what's planned

The Expo phone app runs as a **demo**, with campus search, garage recommendations, and a simulated garage view. Garage locations, permits, walking estimates, availability, and individual spaces are **sample values**, not verified or live UCF parking data. Garage occupancy numbers are not yet synchronized across screens.

The Flask API, camera code, hardware counter, Gemini assistant, and Google Places integration are **works in progress**. The Flask routes reference data/recommendation modules that are not yet present, so do not expect the backend to start successfully yet. The old dashboard is retained under `backend/dashboard/` for its entrance-counter experiment. Directions currently highlight a garage rather than offering turn-by-turn navigation.

## Team workflow

Everyone works in this **single repository**. The default branch is `main`. Keep API keys in local `.env` files, never in GitHub. Do not commit `node_modules`, virtual environments, generated builds, or backups.

For real parking decisions, follow official UCF parking signs and rules.
