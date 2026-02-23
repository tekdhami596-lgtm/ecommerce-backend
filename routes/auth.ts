import { Router } from "express";
import authController from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { loginSchema, signupSchema } from "../validations/authValidation";
import checkAuthentication from "../middlewares/authMiddlewares";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", validate(loginSchema), authController.logout);
router.get("/me", checkAuthentication, authController.getUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/profile", checkAuthentication, authController.getProfile);
router.put("/profile", checkAuthentication, authController.updateProfile);
router.put(
  "/change-password",
  checkAuthentication,
  authController.changePassword,
);

export default router;
