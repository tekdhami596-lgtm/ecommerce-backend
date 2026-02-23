import { Request, Response, NextFunction } from "express";
import cartService from "../services/cartService"

const cartController = {
  addToCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cartService.addToCart(req.user?.id!, req.body.productId);
      res.send({ data: { msg: "Cart updated" } });
    } catch (err) {
      next(err);
    }
  },

  updateCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cartId = Number(req.params.id);
      await cartService.updateCart(cartId, req.body.quantity);
      res.send({ data: { msg: "Cart updated" } });
    } catch (err) {
      next(err);
    }
  },

  deleteCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cartId = Number(req.params.id);
      await cartService.deleteCart(cartId);
      res.send({ data: { msg: "Cart updated" } });
    } catch (err) {
      next(err);
    }
  },

  getCart: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await cartService.getCart(req.user?.id!);
      res.send({ data });
    } catch (err) {
      next(err);
    }
  },
};

export default cartController;
