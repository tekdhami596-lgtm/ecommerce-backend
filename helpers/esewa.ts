import crypto from "crypto";

export const genEsewaSignature = (totalAmount: number, uuid: string) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${uuid},product_code=EPAYTEST`;

  return crypto
    .createHmac("sha256", "8gBm/:&EnhH.1/q")
    .update(message)
    .digest("base64");
};
