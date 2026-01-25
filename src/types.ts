export type BeanType = {
  id: string;
  name: string;
  createdAt: number;
};

export type Extraction = {
  id: string;
  createdAt: number;
  beanTypeId: string;
  grindSetting: number; // 0-50 step 0.25
  weightIn: number; // grams step 0.1
  weightOut: number; // grams step 0.1
  timeSec: number; // whole seconds
  notes: string;
};

export const STORAGE_KEYS = {
  beanTypes: "bean_types",
  extractions: "extractions",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
