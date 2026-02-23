import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const checkAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      const err: any = new Error("Not authenticated");
      err.status = 401;
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    (req as any).user = decoded;
    next();
  } catch (error) {
    const err: any = new Error("Invalid or expired token");
    err.status = 401;
    next(err);
  }
};

export default checkAuthentication;
