import { Router } from "express";
import productController from "../controllers/productController";

const router = Router();
router.get("/",productController.get)
router.get("/:id", productController.getSingleProduct)

export default router;
