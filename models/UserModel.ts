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
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },

    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },

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
    underscored: true,
    timestamps: true,
  },
);

export default User;
