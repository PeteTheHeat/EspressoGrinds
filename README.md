# EspressoGrinds

A dark-mode espresso dial-in tracker built with Expo, React Native, TypeScript, and Expo Router.

Track every extraction, compare results, and iterate quickly.

## Features
- 3-tab workflow: **Add Extraction**, **Extractions**, **Settings**
- Local-only persistence with AsyncStorage
- Sleek dark theme forced regardless of system setting
- Table-style extraction list sorted newest first
- Details screen with delete + confirmation
- Bean type management with safe deletion (blocked when in use)

## Tech Stack
- Expo (default setup)
- React Native + TypeScript
- Expo Router (file-based routing + bottom tabs)
- `@react-native-async-storage/async-storage`

## Project Structure

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

## Getting Started

### Prerequisites
Expo SDK 54 expects a modern Node version. Use Node 20+.

### Install

```bash
npm install
```

### Run the App

```bash
npm run start
```

Then choose one:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan the QR code with Expo Go

## Data Model

### BeanType

```ts
{ id: string; name: string; createdAt: number }
```

### Extraction

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

## Storage Keys
- `bean_types` => `BeanType[]`
- `extractions` => `Extraction[]`

## Notes on Behavior
- You must create at least one bean type in **Settings** before saving extractions.
- Bean type deletion is blocked if the bean is referenced by extractions.
- Numeric inputs are clamped and rounded to their intended step sizes.

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Publish Tips
When publishing to GitHub, consider adding:
- App screenshots or a short screen recording (in a `/docs` folder)
- A brief changelog section
- License information (e.g., MIT)

---

Built for espresso nerds who like tight feedback loops.
