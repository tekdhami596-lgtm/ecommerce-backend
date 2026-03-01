import { NextFunction, Request, Response } from "express";
import productService from "../services/productService";

const productController = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let page: number = (req.query.page as unknown as number) || 1;
      let limit: number = (req.query.limit as unknown as number) || 10;

      const data = await productService.get(req);
      res.send({
        page: page,
        limit,
        total: data.count,
        data: data.rows,
      });
    } catch (err) {
      next(err);
    }
  },

  getSingleProduct: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = await productService.getSingleProduct(req);
      if (!data) {
        return res
          .status(404)
          .send({ message: "Product not found or no longer available" });
      }
      res.send({
        data: data,
      });
    } catch (err) {
      next(err);
    }
  },

  getSellerProducts: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const products = await productService.getSellerProducts(req);
      res.send({ data: products });
    } catch (err) {
      next(err);
    }
  },
  createSellerProduct: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      let product = await productService.create(req);
      res.send({
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteSellerProduct: async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const productId = req.params.id;
      const userId = (req as any).user.id;
      await productService.deleteSellerProduct(productId, userId);

      return res.status(200).send({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  updateSellerProduct: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const productId = req.params.id as string;
      const userId = (req as any).user.id;

      const files = req.files as Express.Multer.File[] | undefined;

      await productService.updateSellerProduct(
        productId,
        userId,
        req.body,
        files,
      );
      return res.status(200).send({
        success: true,
        message: "Product updated successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};
export default productController;
