import { Router } from "express";
import {
  cancelOrderController,
  createOrderController,
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

export default router;
