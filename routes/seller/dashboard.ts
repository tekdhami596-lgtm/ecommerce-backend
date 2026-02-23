import { Router } from "express";
import sellerDashboardController from "../../controllers/sellerDashboardController";

const router = Router();

router.get("/stats", sellerDashboardController.getStats);

export default router;
