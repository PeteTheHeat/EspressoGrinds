# Perfect Pull

Perfect Pull is a dark-mode espresso dial-in tracker built with Expo, React Native, and TypeScript.

This page acts as the public support URL for the iOS app.

## Support
If you need help, found a bug, or want to request a feature, please open an issue in the GitHub repository.

## Data & Privacy
Perfect Pull stores your data locally on your device using AsyncStorage.

- No accounts
- No backend
- No cloud sync

Because data is stored locally, it can be lost if you delete the app or clear app data.

---

## Engineering Info

### Features
- 3-tab workflow: **Add Extraction**, **Extractions**, **Settings**
- Local-only persistence with AsyncStorage
- Dark theme forced regardless of system setting
- Table-style extraction list sorted newest first
- Details screen with delete + confirmation
- Bean type management with safe deletion (blocked when in use)

### Tech Stack
- Expo (default setup)
- React Native + TypeScript
- Expo Router (file-based routing + bottom tabs)
- `@react-native-async-storage/async-storage`

### Project Structure

```text
app/
  _layout.tsx
  index.tsx
  (tabs)/
    _layout.tsx
    add.tsx
    extractions.tsx
    settings.tsx
  extraction/
    [id].tsx
src/
  components/
  storage/
  utils/
  theme.ts
  types.ts
```

### Getting Started

#### Prerequisites
Expo SDK 54 expects Node 20+.

#### Install

```bash
npm install
```

#### Run the App

```bash
npm run start
```

Then choose one:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan the QR code with Expo Go

### Data Model

#### BeanType

```ts
{ id: string; name: string; createdAt: number }
```

#### Extraction

```ts
{
  id: string;
  createdAt: number;
  beanTypeId: string;
  grindSetting: number; // 0-50 step 0.25
  weightIn: number; // grams step 0.1
  weightOut: number; // grams step 0.1
  timeSec: number; // whole seconds
  notes: string;
}
```

### Storage Keys
- `bean_types` => `BeanType[]`
- `extractions` => `Extraction[]`

### Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
```
