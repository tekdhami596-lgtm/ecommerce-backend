import { DataTypes } from "sequelize";
import sequelize from "../connections/db";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      references: { model: "users", key: "id" },
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "done", "failed", "refund"),
      defaultValue: "pending",
    },
    paymentMode: {
      type: DataTypes.ENUM("cash", "esewa", "khalti"),
      defaultValue: "cash",
    },
    transactionCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderStatus: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ),
      defaultValue: "pending",
    },
    buyerName: DataTypes.STRING,
    address: DataTypes.STRING,
    notes: DataTypes.STRING,
  },
  {
    tableName: "orders",
    underscored: true,
    timestamps: true,
  },
);

export default Order;
