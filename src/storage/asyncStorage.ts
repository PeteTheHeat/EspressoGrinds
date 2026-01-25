import AsyncStorage from "@react-native-async-storage/async-storage";

import type { StorageKey } from "@/src/types";

export async function getStoredJSON<T>(key: StorageKey, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read storage key: ${key}`, error);
    throw new Error("We couldn't load your saved data.");
  }
}

export async function setStoredJSON<T>(key: StorageKey, value: T) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to write storage key: ${key}`, error);
    throw new Error("We couldn't save your data.");
  }
}
