import { DataTypes } from "sequelize";
import sequelize from "../connections/db";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("buyer", "seller", "admin"),
      defaultValue: "buyer",
      allowNull: false,
    },

    // ── Shared optional ──────────────────────────────────
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
      defaultValue: null,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY, // stores as YYYY-MM-DD, no time component
      allowNull: true,
      defaultValue: null,
    },

    // ── Buyer only ───────────────────────────────────────
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    // ── Seller only ──────────────────────────────────────
    storeName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    businessAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

    // ── Password Reset ───────────────────────────────────
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    underscored: true, // camelCase → snake_case in DB
    timestamps: true,
  },
);

export default User;
