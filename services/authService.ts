import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel";
import { Request } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Op } from "sequelize";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use Gmail App Password
  },
});

export default {
  signup: async (req: Request) => {
    console.log({ req });
    const {
      firstName,
      lastName,
      email,
      password,
      role = "buyer",
      // shared
      phone,
      gender,
      dateOfBirth,
      // buyer only
      deliveryAddress,
      // seller only
      storeName,
      businessAddress,
    } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    return await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      phone: phone ?? null,
      gender: gender ?? null,
      dateOfBirth: dateOfBirth ?? null,
      // only store buyer field if role is buyer
      deliveryAddress: role === "buyer" ? (deliveryAddress ?? null) : null,
      // only store seller fields if role is seller
      storeName: role === "seller" ? (storeName ?? null) : null,
      businessAddress: role === "seller" ? (businessAddress ?? null) : null,
    });
  },

  login: async (req: Request) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return false;

    const userData = user.toJSON() as Record<string, any>;

    const passwordMatched = await bcrypt.compare(
      req.body.password,
      userData.password,
    );
    if (!passwordMatched) return false;

    delete userData.password;
    delete userData.createdAt;
    delete userData.updatedAt;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment");
    }

    const token = jwt.sign(userData, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { token, user: userData };
  },

  getProfile: async (req: Request) => {
    const userId = (req as any).user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    });
    if (!user) throw new Error("User not found");

    return user;
  },

  updateProfile: async (req: Request) => {
    const userId = (req as any).user.id;
    const { firstName, lastName, phone, gender, dateOfBirth, deliveryAddress } =
      req.body;

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    await user.update({
      firstName,
      lastName,
      phone: phone ?? null,
      gender: gender ?? null,
      dateOfBirth: dateOfBirth ?? null,
      // only update deliveryAddress if user is a buyer
      ...(user.getDataValue("role") === "buyer" && {
        deliveryAddress: deliveryAddress ?? null,
      }),
    });

    const updated = user.toJSON() as Record<string, any>;
    delete updated.password;
    delete updated.createdAt;
    delete updated.updatedAt;
    return updated;
  },

  changePassword: async (req: Request) => {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const userData = user.toJSON() as Record<string, any>;
    const match = await bcrypt.compare(currentPassword, userData.password);
    if (!match) throw new Error("Current password is incorrect");

    await user.update({ password: await bcrypt.hash(newPassword, 10) });
    return { message: "Password updated successfully" };
  },

  forgotPassword: async (email: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("No account found with this email");

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

    await user.update({ resetToken: token, resetTokenExpiry: expiry });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Dokomart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
      <p>You requested a password reset.</p>
      <a href="${resetUrl}" style="background:#4f46e5;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">
        Reset Password
      </a>
      <p>This link expires in 30 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }, // not expired
      },
    });

    if (!user) throw new Error("Invalid or expired reset token");

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    });
  },
};
