/**
 * Represents a valid JSON value that can be serialized and parsed.
 * This type excludes functions, symbols, and class instances.
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Type guard to check if a value is a valid JSONValue.
 * Rejects functions, symbols, undefined, and class instances.
 */
export function isJSONValue(value: unknown): value is JSONValue {
  if (value === null) {
    return true;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (
    typeof value === "undefined" ||
    typeof value === "function" ||
    typeof value === "symbol"
  ) {
    return false;
  }

  /* Rejects class instances (except plain objects and arrays) */
  if (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Error
  ) {
    return false;
  }

  /* Check if it's an array */
  if (Array.isArray(value)) {
    return value.every((item) => isJSONValue(item));
  }

  /* Check if it's a plain object */
  if (typeof value === "object" && value !== null) {
    /* Reject if jas a constructor that's not Object */
    if (value.constructor !== Object && value.constructor !== undefined) {
      return false;
    }

    return Object.values(value).every((val) => isJSONValue(val));
  }

  return false;
}
