import { DataTypes } from "sequelize";
import sequelize from "../connections/db";
import Product from "./ProductsModel";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    path: {
      type: DataTypes.STRING,
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
  },
  {
    tableName: "product_images",
    underscored: true,
    timestamps: true,
  },
);

export default ProductImage;
