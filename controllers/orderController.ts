import { Request, Response, NextFunction } from "express";
import {
  cancelOrderService,
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  trackOrderService,
} from "../services/orderService";
import { verifyEsewaPayment } from "../services/EsewaService";
import { Reference } from "joi";
import Order from "../models/Order";

// ── Create Order ──────────────────────────────────────────────────────────────

export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id ?? req.body.userId;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    const { orderItems, userInfo, paymentMode } = req.body;
    const { name, address, notes } = userInfo;

    const { order, esewaPayload } = await createOrderService(
      Number(userId),
      orderItems,
      name,
      address,
      notes,
      paymentMode,
    );

    res.status(201).json({
      message: "Order created",
      data: order,
      esewa: esewaPayload,
    });
  } catch (err) {
    next(err);
  }
};

// ── Verify eSewa Payment ──────────────────────────────────────────────────────
//
// Two-step flow:
//   1. esewaService.verifyEsewaPayment  → cryptographic trust (HMAC + eSewa API)
//   2. orderService.finaliseOrderPayment → amount integrity check + DB update

export const verifyEsewa = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { data: encodedData } = req.body;

  if (!encodedData) {
    res.status(400).json({ success: false, message: "Missing payment data" });
    return;
  }

  try {
    const esewaResult = await verifyEsewaPayment(encodedData);

    if (!esewaResult.success) {
      const statusCode = esewaResult.message.includes("not found") ? 404 : 400;
      res.status(statusCode).json(esewaResult);
      return;
    }

    // esewaService already updated paymentStatus — just return the result
    res.json({
      success: true,
      message: esewaResult.message,
      order: esewaResult.order, // matches what EsewaSuccess.tsx expects
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ── Get My Orders ─────────────────────────────────────────────────────────────

export const getMyOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    const orders = await getMyOrdersService(Number(userId));

    res.status(200).json({ message: "Orders fetched", data: orders });
  } catch (err) {
    next(err);
  }
};
export const getOrderByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id ?? req.body.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      res.status(400).json({ message: "Invalid order ID" });
      return;
    }

    const order = await getOrderByIdService(orderId, Number(userId));
    res.status(200).json({ message: "Order fetched", data: order });
  } catch (err: any) {
    if (err.message === "Order not found") {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
};

export const trackOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await trackOrderService(req.params.reference as string);
    res.status(200).json({ message: "Order fetched", data: order });
  } catch (err: any) {
    if (err.message === "Order not found") {
      res.status(404).json({ message: err.message });
      return;
    }
    next(err);
  }
};

export const cancelOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      res.status(400).json({ message: "Invalid order ID" });
      return;
    }

    const order = await cancelOrderService(orderId, Number(userId));
    res.json({ message: "Order cancelled", data: order });
  } catch (err: any) {
    if (
      err.message.includes("cannot be cancelled") ||
      err.message.includes("not found")
    ) {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
};

export const deleteOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      res.status(400).json({ message: "Invalid order ID" });
      return;
    }

    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (order.getDataValue("orderStatus") !== "cancelled") {
      res.status(400).json({ message: "Only cancelled orders can be deleted" });
      return;
    }

    await order.destroy();
    res.json({ message: "Order deleted" });
  } catch (err) {
    next(err);
  }
};
