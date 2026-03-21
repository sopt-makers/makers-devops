export function assert(condition: boolean, error: Error | string): asserts condition {
  if (!condition) {
    if (typeof error === "string") {
      throw new Error(error);
    }
    throw error;
  }
}

export function assertNonNullish<T>(
  value: T | null | undefined,
  error: Error | string,
): asserts value is NonNullable<T> {
  if (value == null) {
    if (typeof error === "string") {
      throw new Error(error);
    }
    throw error;
  }
}
