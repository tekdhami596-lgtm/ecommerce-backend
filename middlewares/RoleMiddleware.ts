import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    role: "admin" | "seller" | "buyer";
  };
}


const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

export default roleMiddleware;
