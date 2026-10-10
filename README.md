# Parkour 🚗

## What can Parkour do?

- **Choose your destination:** Select a campus location you're heading to.
- **Choose your permit:** Pick Student or Employee to see matching garage recommendations.
- **Compare garages:** See suggested garages and their estimated walking distances.
- **Explore parking floors:** Open a garage to view a visual layout of sample parking spaces.
- **Save your spot:** Use the prototype's parking-space selection feature to remember where you parked.

## How to run the app

You need **Node.js** installed on your computer and **Expo Go** on your phone.

1. Download or clone this repository.
2. Open a terminal in the project folder.
3. Run these commands:

```powershell
cd mobile
npm install
npx expo start --clear --tunnel
```

4. Scan the QR code using Expo Go to open the app.

If you're already inside the `mobile` folder, skip `cd mobile`.

## code?

- `mobile/` — the phone app.
- `mobile/src/app/` — screens such as Home, Explore, and Garage.
- `mobile/src/components/` — reusable parts of the interface.
- `mobile/src/data/parking.ts` — sample destinations and garage information.
- 
## What's real, and what's a demo?

The garage locations, permit rules, available-space counts, and individual parking spots currently use sample data. They do **not** show real-time UCF parking availability. The garage floor simulation isn't synchronized with the garage availability numbers on the Explore screen yet. The directions feature currently highlights a garage on the map; it does not provide full turn-by-turn navigation.

## Working towards

We want to connect parking availability to real occupancy information, improve navigation, and make it easier to find your car after parking.
