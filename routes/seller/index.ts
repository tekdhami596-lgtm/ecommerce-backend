import { Router } from "express";
import ProductRoute from "./product";
import OrderRoute from "./order";
import dashboardRoute from "./dashboard";

const router = Router();

router.use("/products", ProductRoute);
router.use("/orders", OrderRoute);
router.use("/dashboard", dashboardRoute);

export default router;
