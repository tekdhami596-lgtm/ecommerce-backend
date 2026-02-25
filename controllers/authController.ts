import { NextFunction, Request, Response } from "express";
import authService from "../services/authService";

const authController = {
  signup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req);
      const user = await authService.signup(req);

      if (user) {
        const userData = user.toJSON() as Record<string, any>;
        delete userData.password;
        res
          .status(201)
          .send({ message: "Account created successfully", user: userData });
      }
    } catch (err) {
      next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req);
      if (!result)
        return res.status(401).send({ message: "Invalid credentials" });

      const { token, user } = result;

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    
      });

      
      res.send({ success: true, user });
    } catch (err) {
      next(err);
    }
  },

  
  logout: (req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ success: true, message: "Logged out" });
  },

  getUser: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.send({ data: (req as any).user });
    } catch (err) {
      next(err);
    }
  },

  getProfile: async (req: Request, res: Response) => {
    try {
      const user = await authService.getProfile(req);
      res.status(200).json(user);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const user = await authService.updateProfile(req);
      res.status(200).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },

  changePassword: async (req: Request, res: Response) => {
    try {
      const result = await authService.changePassword(req);
      res.status(200).json(result);
    } catch (err: any) {
      const status =
        err.message === "Current password is incorrect" ? 401 : 400;
      res.status(status).json({ message: err.message });
    }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ success: true, message: "Reset link sent to your email" });
    } catch (err: any) {
      next(err);
    }
  },

  resetPassword: async (
    req: Request<{ token: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await authService.resetPassword(req.params.token, req.body.password);
      res.json({ success: true, message: "Password reset successfully" });
    } catch (err: any) {
      next(err);
    }
  },
};

export default authController;
