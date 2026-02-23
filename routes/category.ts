import { Router } from "express";
import categoryController from "../controllers/categoryController";
import checkAuthentication from "../middlewares/authMiddlewares";
import roleMiddleware from "../middlewares/RoleMiddleware";

const router = Router();
router.get("/", categoryController.getCategories);
router.get("/flat", categoryController.getCategoriesFlat);

router.post(
  "/",
  checkAuthentication,
  roleMiddleware(["admin", "seller"]),
  categoryController.createCategory,
);
router.patch(
  "/:id",
  checkAuthentication,
  roleMiddleware(["admin", "seller"]),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  checkAuthentication,
  roleMiddleware(["admin", "seller"]),
  categoryController.deleteCategory,
);

export default router;
