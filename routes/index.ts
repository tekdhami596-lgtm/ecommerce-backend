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

const router = Router();

router.use("/auth", authRoute);
router.use("/products", productRoute);
router.use("/seller", checkAuthentication, SellerRoutes);
router.use("/categories", CategoryRoute);
router.use("/carts", checkAuthentication, cartRoutes);
router.use("/orders", checkAuthentication, orderRoutes);
router.use(
  "/admin",
  checkAuthentication,
  roleMiddleware(["admin"]),
  adminRoutes,
);
// In your public routes
router.get("/banners", bannerController.getAll);

export default router;
