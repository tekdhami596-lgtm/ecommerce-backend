import { Request, Response, NextFunction } from "express";
import adminService from "../services/adminService ";

const adminController = {
  // GET /api/admin/stats
  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getStats();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/admin/users
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, role } = req.query as { search?: string; role?: string };
      const data = await adminService.getAllUsers(search, role);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/admin/users/:id
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

  // GET /api/admin/sellers
  getSellers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await adminService.getSellers();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/admin/sellers/:id
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

  // GET /api/admin/products
  getAllProducts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query as { search?: string };
      const data = await adminService.getAllProducts(search);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/admin/products/:id
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

  // GET /api/admin/orders
  getAllOrders: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentStatus } = req.query as { paymentStatus?: string };
      const data = await adminService.getAllOrders(paymentStatus);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/admin/orders/:id/status
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
