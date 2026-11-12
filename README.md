# Solace AI

Solace is a React Native and Expo wellness companion. The first phase establishes the mobile shell and a calm visual system; feature work is added incrementally after the shell is running.

## Architecture

```text
app/                 Expo Router routes and tab navigation
src/theme/           Shared design tokens
src/components/      Reusable visual building blocks (next phase)
src/features/        Onboarding, mood, chat, journal, mindfulness, insights, habits
src/services/        API clients and persistence adapters
server/              Express API, MongoDB models, AI service, safety middleware
```

The mobile app will call a REST API. Groq credentials belong only in the Node server environment, never in Expo config or client code. Sensitive journal and mood data will be collected only for user-facing features and will have explicit retention and deletion controls.

## Phase 1 dependencies

- `expo`, `react`, `react-native`: Expo and the native app runtime.
- `expo-router`, `react-native-screens`, `react-native-safe-area-context`: file-based navigation and device-safe layouts.
- `expo-linear-gradient`: soft gradient surfaces on the home screen.
- `lucide-react-native`, `react-native-svg`: consistent line icons and their SVG renderer.
- `react-native-reanimated`: the animation foundation for later breathing and transition interactions.
- `expo-status-bar`: status bar styling.
- `@react-native-async-storage/async-storage`: saves onboarding choices locally on the device.
- `typescript`, `@types/react`: TypeScript authoring and checking.

## Run on Windows

From this folder, install packages and start Expo:

```powershell
npm install
npx expo install --fix
npm run start
```

Press `a` in the Expo terminal for an Android emulator, or scan the QR code with Expo Go. This starter targets the current Expo SDK. Expo Go must support the SDK installed by `npm install`.

On first launch, onboarding selections and the optional reminder preference are saved on the device. The reminder is a saved preference only; notification delivery is not configured in Phase 1. The dashboard mood graph is clearly marked preview data.

For browser preview, install Expo's web peers and start the web target:

```powershell
npx expo install react-dom react-native-web
npm run web
```

For a TypeScript check:

```powershell
npm run typecheck
```
