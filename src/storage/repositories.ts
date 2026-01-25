import { generateId } from "@/src/utils/id";
import { getStoredJSON, setStoredJSON } from "@/src/storage/asyncStorage";
import { STORAGE_KEYS, type BeanType, type Extraction } from "@/src/types";

type NewExtractionInput = Pick<
  Extraction,
  "beanTypeId" | "grindSetting" | "weightIn" | "weightOut" | "timeSec" | "notes"
>;

export type DeleteBeanTypeResult =
  | { ok: true }
  | { ok: false; reason: "in_use"; count: number };

export async function getBeanTypes() {
  const beanTypes = await getStoredJSON<BeanType[]>(STORAGE_KEYS.beanTypes, []);
  return beanTypes.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addBeanType(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Bean name is required.");
  }

  const beanTypes = await getBeanTypes();
  const newBean: BeanType = {
    id: generateId(),
    name: trimmed,
    createdAt: Date.now(),
  };

  const next = [...beanTypes, newBean];
  await setStoredJSON(STORAGE_KEYS.beanTypes, next);
  return newBean;
}

export async function deleteBeanType(id: string): Promise<DeleteBeanTypeResult> {
  const count = await countExtractionsForBeanType(id);
  if (count > 0) {
    return { ok: false, reason: "in_use", count };
  }

  const beanTypes = await getBeanTypes();
  const next = beanTypes.filter((bean) => bean.id !== id);
  await setStoredJSON(STORAGE_KEYS.beanTypes, next);
  return { ok: true };
}

export async function getExtractions() {
  const extractions = await getStoredJSON<Extraction[]>(STORAGE_KEYS.extractions, []);
  return extractions.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getExtractionById(id: string) {
  const extractions = await getExtractions();
  return extractions.find((extraction) => extraction.id === id) ?? null;
}

export async function addExtraction(input: NewExtractionInput) {
  ensureValidExtractionInput(input);

  const extraction: Extraction = {
    id: generateId(),
    createdAt: Date.now(),
    ...input,
  };

  const extractions = await getExtractions();
  const next = [extraction, ...extractions];
  await setStoredJSON(STORAGE_KEYS.extractions, next);
  return extraction;
}

export async function deleteExtraction(id: string) {
  const extractions = await getExtractions();
  const next = extractions.filter((extraction) => extraction.id !== id);
  await setStoredJSON(STORAGE_KEYS.extractions, next);
}

export async function countExtractionsForBeanType(beanTypeId: string) {
  const extractions = await getExtractions();
  return extractions.reduce((count, extraction) => {
    return extraction.beanTypeId === beanTypeId ? count + 1 : count;
  }, 0);
}

function ensureValidExtractionInput(input: NewExtractionInput) {
  const requiredNumberFields: Array<keyof NewExtractionInput> = [
    "grindSetting",
    "weightIn",
    "weightOut",
    "timeSec",
  ];

  if (!input.beanTypeId) {
    throw new Error("Bean type is required.");
  }

  for (const field of requiredNumberFields) {
    const value = input[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error("Invalid extraction values.");
    }
  }
}
