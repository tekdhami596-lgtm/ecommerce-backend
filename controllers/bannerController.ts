import { Request, Response, NextFunction } from "express";
import bannerService from "../services/bannerService";

const bannerController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const banners = await bannerService.getAll();
      res.json({ data: banners });
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "Image is required" });
        return;
      }
      const banner = await bannerService.create(req.file, req.body);
      res.status(201).json({ data: banner });
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      if (!id) {
        res.status(400).json({ message: "ID is required" });
        return;
      }
      await bannerService.delete(id);
      res.json({ message: "Banner deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};

export default bannerController;
