import { DataTypes } from "sequelize";
import sequelize from "../connections/db"

const Cart = sequelize.define(
  "Cart",
  {
    userId: {
      type: DataTypes.BIGINT,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    productId: {
      type: DataTypes.BIGINT,
      references: {
        model: "products",
        key: "id",
      },
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "carts",
    underscored: true,
    timestamps: true,
  },
);

export default Cart;
