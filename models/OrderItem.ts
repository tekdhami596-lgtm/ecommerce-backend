import { DataTypes } from "sequelize";
import sequelize from "../connections/db";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.BIGINT,
      references: { model: "orders", key: "id" },
      allowNull: false,
    },
    productId: {
      type: DataTypes.BIGINT,
      references: { model: "products", key: "id" },
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending", "accepted", "processing",
        "shipping", "completed", "rejected", "cancelled"
      ),
      defaultValue: "pending",
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    underscored: true,
    timestamps: true,
  },
);

export default OrderItem;