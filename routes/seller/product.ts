import { Router } from "express";
import productController from "../../controllers/productController";
import { upload } from "../../config/cloudinary";

const router = Router();

router.get("/", productController.getSellerProducts);
router.get("/:id", productController.getSingleProduct);
router.post(
  "/",
  upload.array("images", 12),
  (req, res, next) => {
    console.log("Uploaded files:", req.files);
    next();
  },

  productController.createSellerProduct,
);
router.delete("/:id", productController.deleteSellerProduct);
router.patch(
  "/:id",
  upload.array("images", 12),
  productController.updateSellerProduct,
);

export default router;
