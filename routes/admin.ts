import { Router } from "express";
import adminController from "../controllers/adminController ";
import authMiddleware from "../middlewares/authMiddlewares";
import roleMiddleware from "../middlewares/RoleMiddleware";
import { upload } from "../config/cloudinary";
import bannerController from "../controllers/bannerController";

const router = Router();


router.use(authMiddleware);
router.use(roleMiddleware(["admin"]));

router.get("/stats", adminController.getStats);

router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);

router.get("/sellers", adminController.getSellers);
router.delete("/sellers/:id", adminController.deleteSeller);

router.get("/products", adminController.getAllProducts);
router.delete("/products/:id", adminController.deleteProduct);

router.get("/orders", adminController.getAllOrders);
router.patch("/orders/:id/status", adminController.updateOrderStatus);

router.get("/banners", bannerController.getAll);
router.post("/banners", upload.single("image"), bannerController.create);
router.delete("/banners/:id", bannerController.delete);

export default router;
