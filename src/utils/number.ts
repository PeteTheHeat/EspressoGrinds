export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function roundToStep(value: number, step: number) {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
    return value;
  }

  const rounded = Math.round(value / step) * step;
  const stepDecimals = countDecimals(step);
  return Number(rounded.toFixed(stepDecimals));
}

export function sanitizeNumericInput(text: string) {
  return text.replace(/,/g, ".").trim();
}

export function parseNumericInput(text: string): number | null {
  const sanitized = sanitizeNumericInput(text);
  if (!sanitized) {
    return null;
  }

  if (sanitized === "." || sanitized === "-" || sanitized === "+") {
    return null;
  }

  // Allow partial decimals like "12." by trimming trailing dots for parsing.
  const normalized = sanitized.endsWith(".")
    ? sanitized.slice(0, -1)
    : sanitized;

  if (!normalized) {
    return null;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function formatFixed(value: number, digits: number) {
  return value.toFixed(digits);
}

export function formatStep(value: number, step: number) {
  const decimals = countDecimals(step);
  return value.toFixed(decimals);
}

export function formatStepTrimmed(value: number, step: number) {
  const decimals = countDecimals(step);
  const fixed = value.toFixed(decimals);
  return stripTrailingZeros(fixed);
}

function countDecimals(step: number) {
  const stepString = step.toString();
  const decimalIndex = stepString.indexOf(".");
  return decimalIndex >= 0 ? stepString.length - decimalIndex - 1 : 0;
}

function stripTrailingZeros(value: string) {
  const stripped = value.replace(/\.?0+$/, "");
  return stripped.length > 0 ? stripped : "0";
}
