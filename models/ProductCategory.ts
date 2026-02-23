import { DataTypes } from "sequelize";
import sequelize from "../connections/db";

const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    categoryId: {
      type: DataTypes.BIGINT,
      references: {
        model: "categories",
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
  },
  {
    tableName: "product_categories",
    underscored: true,
    timestamps: true,
  },
);

export default ProductCategory;
