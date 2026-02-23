import { NextFunction, Request, Response } from "express";
import categoryService from "../services/categoryService";

// Matches the user shape set by your existing authMiddleware
interface AuthRequest extends Request {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    role: "admin" | "seller" | "buyer";
  };
}

const categoryController = {
  // GET /api/categories — public, returns nested tree
  getCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await categoryService.getTree();
      res.send({ data: categories });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/categories/flat — public, returns flat list (useful for selects)
  getCategoriesFlat: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const categories = await categoryService.getAll();
      res.send({ data: categories });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/categories — admin + seller only
  createCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { title, parentId } = req.body;
      const userId = authReq.user!.id;
      const role = authReq.user!.role as "admin" | "seller";

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      const data = await categoryService.create(
        title.trim(),
        parentId ? Number(parentId) : null,
        userId,
        role,
      );

      res.status(201).json({ message: "Category created", data });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/categories/:id — admin + own seller
  updateCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const id = Number(req.params.id);
      const { title } = req.body;
      const userId = authReq.user!.id;
      const role = authReq.user!.role as "admin" | "seller";

      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }

      const data = await categoryService.update(id, title.trim(), userId, role);
      res.json({ message: "Category updated", data });
    } catch (err: any) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      next(err);
    }
  },

  // DELETE /api/categories/:id — admin + own seller
  deleteCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const id = Number(req.params.id);
      const userId = authReq.user!.id;
      const role = authReq.user!.role as "admin" | "seller";

      const result = await categoryService.delete(id, userId, role);
      res.json(result);
    } catch (err: any) {
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }
      next(err);
    }
  },
};

export default categoryController;
