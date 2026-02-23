import { Request, Response } from "express";
import sellerDashboardService from "../services/sellerDashboardService";

const sellerDashboardController = {
  getStats: async (req: Request, res: Response) => {
    try {
      const stats = await sellerDashboardService.getStats(req);
      res.json({ success: true, data: stats });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard stats",
      });
    }
  },
};

export default sellerDashboardController;