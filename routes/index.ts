import { Router } from "express";
import authRoute from "./auth";
import productRoute from "./product";
import checkAuthentication from "../middlewares/authMiddlewares";
import SellerRoutes from "./seller";
import CategoryRoute from "./category";
import cartRoutes from "./Cart";
import orderRoutes from "./order";
import adminRoutes from "./admin";
import roleMiddleware from "../middlewares/RoleMiddleware";
import bannerController from "../controllers/bannerController";
import {
  adminLimiter,
  authLimiter,
  checkoutLimiter,
  publicLimiter,
  sellerLimiter,
  userActionLimiter,
} from "../middlewares/rateLimiter";

const router = Router();

router.use("/auth", authLimiter, authRoute);
router.use("/products", publicLimiter, productRoute);
router.use("/seller", sellerLimiter, checkAuthentication, SellerRoutes);
router.use("/categories", publicLimiter, CategoryRoute);
router.use("/carts", userActionLimiter, checkAuthentication, cartRoutes);
router.use("/orders", checkoutLimiter, checkAuthentication, orderRoutes);
router.use(
  "/admin",
  adminLimiter,
  checkAuthentication,
  roleMiddleware(["admin"]),
  adminRoutes,
);
// In your public routes
router.get("/banners", publicLimiter, bannerController.getAll);

export default router;
