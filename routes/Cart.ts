import { Router } from "express";
import cartController from "../controllers/cartController";

const router = Router();

router.post("/", cartController.addToCart);
router.put("/:id", cartController.updateCart);
router.delete("/:id", cartController.deleteCart);
router.get("/", cartController.getCart);

export default router;
