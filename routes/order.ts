import { Router } from "express";
import {
  cancelOrderController,
  createOrderController,
  deleteOrderController,
  getMyOrdersController,
  getOrderByIdController,
  trackOrderController,
  verifyEsewa,
} from "../controllers/orderController";

const router = Router();

router.post("/", createOrderController);
router.post("/verify-esewa", verifyEsewa);
router.get("/my-orders", getMyOrdersController);
router.get("/:id", getOrderByIdController);
router.get("/track/:reference", trackOrderController);
router.patch("/:id/cancel", cancelOrderController);
router.delete("/:id", deleteOrderController);

export default router;
