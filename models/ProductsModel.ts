import { DataTypes } from "sequelize";
import sequelize from "../connections/db";
import User from "./UserModel";

const Product = sequelize.define(
  "Product",
  {
    title: {
     
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    shortDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "products",
    underscored: true,
    timestamps: true,
  },
);

export default Product;
