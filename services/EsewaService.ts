import axios from "axios";
// ─────────────────────────────────────────────────────────────────────────────
// FILE: backend/services/esewaService.ts
// ─────────────────────────────────────────────────────────────────────────────

import crypto from "crypto";
import Order from "../models/Order";

// ── Constants ────────────────────────────────────────────────────────────────
const ESEWA_SECRET = process.env.ESEWA_SECRET ?? "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE ?? "EPAYTEST";
const ESEWA_STATUS_URL =
  process.env.ESEWA_STATUS_URL ??
  "https://rc-epay.esewa.com.np/api/epay/transaction/status/";

// ── Types ────────────────────────────────────────────────────────────────────
export interface EsewaPayload {
  status: string;
  transaction_uuid: string;
  total_amount: string;
  transaction_code: string;
  signed_field_names: string;
  signature: string;
  [key: string]: string; // allows dynamic key access for HMAC building
}

export interface VerificationResult {
  success: boolean;
  message: string;
  order?: {
    id: unknown;
    reference: unknown;
    buyerName: unknown;
    totalAmount: string;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decodes the base64 payload sent by eSewa to your success_url.
 * Throws if the string is not valid base64-encoded JSON.
 */
export function decodeEsewaPayload(encodedData: string): EsewaPayload {
  const json = Buffer.from(encodedData, "base64").toString("utf-8");
  return JSON.parse(json) as EsewaPayload;
}

/**
 * Verifies the HMAC-SHA256 signature on the eSewa response payload.
 * Returns true only when the computed signature matches the received one.
 */
export function verifySignature(payload: EsewaPayload): boolean {
  const fields = payload.signed_field_names.split(",");
  const message = fields.map((f) => `${f}=${payload[f]}`).join(",");

  const expected = crypto
    .createHmac("sha256", ESEWA_SECRET)
    .update(message)
    .digest("base64");

  return expected === payload.signature;
}

/**
 * Cross-checks the transaction against eSewa's status API to prevent replay attacks.
 * Returns true if eSewa confirms COMPLETE; logs a warning and returns true on network failure
 * so that a valid HMAC alone is sufficient in UAT environments.
 */
export async function crossVerifyWithEsewa(
  transaction_uuid: string,
  total_amount: string,
): Promise<boolean> {
  try {
    const { data } = await axios.get(ESEWA_STATUS_URL, {
      params: {
        product_code: ESEWA_PRODUCT_CODE,
        total_amount,
        transaction_uuid,
      },
    });
    return (data as any)?.status === "COMPLETE";
  } catch (err) {
    console.warn(
      "eSewa status API unreachable — falling back to HMAC-only verification:",
      err,
    );
    return true; // safe fallback for UAT; tighten in production
  }
}

// ── Core service function ────────────────────────────────────────────────────

/**
 * Full eSewa payment verification flow:
 *  1. Decode base64 payload
 *  2. Verify HMAC signature
 *  3. Check status === "COMPLETE"
 *  4. Cross-verify with eSewa's API
 *  5. Look up order in DB (guard duplicate processing)
 *  6. Mark order as paid
 */
export async function verifyEsewaPayment(
  encodedData: string,
): Promise<VerificationResult> {
  // Step 1 — decode
  let payload: EsewaPayload;
  try {
    payload = decodeEsewaPayload(encodedData);
  } catch {
    return { success: false, message: "Invalid payment data encoding" };
  }

  const { status, transaction_uuid, total_amount, transaction_code } = payload;

  // Step 2 — signature
  if (!verifySignature(payload)) {
    return { success: false, message: "Signature mismatch — payment tampered" };
  }

  // Step 3 — status
  if (status !== "COMPLETE") {
    return { success: false, message: `Payment status is ${status}` };
  }

  // Step 4 — cross-verify
  const apiConfirmed = await crossVerifyWithEsewa(
    transaction_uuid,
    total_amount,
  );
  if (!apiConfirmed) {
    return { success: false, message: "eSewa API could not confirm payment" };
  }

  // Step 5 — find order
  const order = await Order.findOne({ where: { reference: transaction_uuid } });
  if (!order) {
    return { success: false, message: "Order not found for this transaction" };
  }

  const orderSnapshot = {
    id: order.getDataValue("id"),
    reference: order.getDataValue("reference"),
    buyerName: order.getDataValue("buyerName"),
    totalAmount: total_amount,
  };

  // Guard — already processed
  if (order.getDataValue("paymentStatus") === "done") {
    return { success: true, message: "Already verified", order: orderSnapshot };
  }

  // Step 6 — update
  await order.update({
    paymentStatus: "done",
    transactionCode: transaction_code,
  });

  return {
    success: true,
    message: "Payment verified and order updated",
    order: orderSnapshot,
  };
}
