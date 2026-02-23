import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Product from "../models/ProductsModel";
import { genEsewaSignature } from "../helpers/esewa";

// ── Types ────────────────────────────────────────────────────────────────────

export interface OrderItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateOrderResult {
  order: ReturnType<typeof Order.build>;
  esewaPayload: EsewaPayload;
}

interface EsewaPayload {
  tax_amount: number;
  total_amount: number;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: number;
  product_delivery_charge: number;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generates a unique order reference string. */
function generateReference(): string {
  return `ORD-${new Date().getFullYear()}-${Date.now()}`;
}

/**
 * Fetches a product by PK and throws a descriptive error if missing.
 * Centralises the repeated Product.findByPk pattern.
 */
async function getProductOrThrow(productId: number): Promise<any> {
  const product = await Product.findByPk(productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  return product;
}

/** Calculates the total cost across a set of { price, quantity } pairs. */
function calcTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ── Create Order ─────────────────────────────────────────────────────────────

/**
 * 1. Validates stock for every item upfront (no partial side-effects on failure).
 * 2. Creates the Order record.
 * 3. Fetches products once, creates OrderItems, deducts stock.
 * 4. Returns the order + eSewa payload for the frontend to initiate payment.
 *
 * NOTE: Stock is deducted optimistically for all payment modes.
 * For eSewa, if payment fails the stock should be restored — handle that
 * in a separate cancelOrder / payment-failure flow.
 */
export const createOrderService = async (
  userId: number,
  orderItems: OrderItemPayload[],
  buyerName: string,
  address: string,
  notes: string,
  paymentMode: string,
): Promise<CreateOrderResult> => {
  const reference = generateReference();

  // ── Step 1: Validate stock (fail fast, no DB writes yet) ─────────────────
  for (const item of orderItems) {
    const product = await getProductOrThrow(item.productId);
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.title}". ` +
          `Available: ${product.stock}, Requested: ${item.quantity}`,
      );
    }
  }

  // ── Step 2: Create the order ──────────────────────────────────────────────
  const order = await Order.create({
    userId,
    reference,
    buyerName,
    address,
    notes,
    paymentStatus: "pending",
    paymentMode,
  });

  // ── Step 3 & 4: Resolve products once, then create items + deduct stock ───
  // Products were validated above; re-fetch to build order items in one loop.
  let totalAmount = 0;

  for (const item of orderItems) {
    const product = await getProductOrThrow(item.productId);
    const price = Number(product.price);
    totalAmount += price * item.quantity;

    await OrderItem.create({
      orderId: Number(order.getDataValue("id")),
      productId: item.productId,
      quantity: item.quantity,
      price,
      productName: product.title,
      productDescription: product.shortDescription ?? "",
    });

    await product.decrement("stock", { by: item.quantity });
  }

  // ── Step 5: Build eSewa payload ───────────────────────────────────────────
  const esewaPayload: EsewaPayload = {
    tax_amount: 0,
    total_amount: totalAmount,
    transaction_uuid: reference,
    product_code: process.env.ESEWA_PRODUCT_CODE ?? "EPAYTEST",
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: `${process.env.CLIENT_URL ?? "https://localhost:3000"}/order/${reference}/success`,
    failure_url:
      process.env.ESEWA_FAILURE_URL ?? "https://developer.esewa.com.np/failure",
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: genEsewaSignature(totalAmount, reference),
  };

  return { order, esewaPayload };
};

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Returns all orders for a user, newest first, with their items. */
export const getMyOrdersService = async (userId: number) => {
  return Order.findAll({
    where: { userId },
    include: [{ model: OrderItem, as: "orderItems" }],
    order: [["createdAt", "DESC"]],
  });
};

/** Returns a single order by ID, scoped to the requesting user. */
export const getOrderByIdService = async (orderId: number, userId: number) => {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [{ model: OrderItem, as: "orderItems" }],
  });

  if (!order) throw new Error("Order not found");

  return order;
};

export const trackOrderService = async (reference: string) => {
  const order = await Order.findOne({
    where: { reference },
    include: [{ model: OrderItem, as: "orderItems" }],
  });

  if (!order) throw new Error("Order not found");

  return order;
};

// orderService.ts
export const cancelOrderService = async (orderId: number, userId: number) => {
  const order = await Order.findOne({ where: { id: orderId, userId } });
  if (!order) throw new Error("Order not found");

  const status = order.getDataValue("orderStatus");
  // Only allow cancel if not already shipped/delivered
  if (["shipped", "delivered"].includes(status)) {
    throw new Error("Order cannot be cancelled after shipping");
  }

  // Restore stock
  const items = await OrderItem.findAll({ where: { orderId } });
  for (const item of items) {
    const product = await Product.findByPk(item.getDataValue("productId"));
    await product?.increment("stock", { by: item.getDataValue("quantity") });
  }

  await order.update({ orderStatus: "cancelled" });
  return order;
};
