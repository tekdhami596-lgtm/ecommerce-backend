import { Request, Response, NextFunction } from "express";
import adminService from "../services/adminService ";

const adminController = {

  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getStats();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, role } = req.query as { search?: string; role?: string };
      const data = await adminService.getAllUsers(search, role);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },


  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.deleteUser(Number(req.params.id));
      res.json(data);
    } catch (err: any) {
      if (err.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  },


  getSellers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getSellers();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },


  deleteSeller: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.deleteSeller(Number(req.params.id));
      res.json(data);
    } catch (err: any) {
      if (err.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  },

 
  getAllProducts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query as { search?: string };
      const data = await adminService.getAllProducts(search);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  deleteProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.deleteProduct(Number(req.params.id));
      res.json(data);
    } catch (err: any) {
      if (err.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  },


  getAllOrders: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentStatus } = req.query as { paymentStatus?: string };
      const data = await adminService.getAllOrders(paymentStatus);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },


  updateOrderStatus: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { paymentStatus } = req.body;
      const data = await adminService.updatePaymentStatus(
        Number(req.params.id),
        paymentStatus,
      );
      res.json({ message: "Order payment status updated", data });
    } catch (err: any) {
      if (err.status)
        return res.status(err.status).json({ message: err.message });
      next(err);
    }
  },
};

export default adminController;
