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

import crypto from "crypto";

export function verifySignature(secret: string, payload: string, signature: string) {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(`sha256=${hmac.update(payload).digest("hex")}`, "utf8");

  const checksum = Buffer.from(signature, "utf8");

  if (checksum.length !== digest.length) {
    throw new Error("Invalid signature");
  }
  return crypto.timingSafeEqual(digest, checksum);
}
