import { DataTypes } from "sequelize";
import sequelize from "../connections/db";
import { date } from "joi";

const Category = sequelize.define(
  "Category",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentId: {
      type: DataTypes.BIGINT,
      references: {
        model: "categories",
        key: "id",
      },
    },
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdByRole: {
      type: DataTypes.ENUM("admin", "seller"),
      allowNull: true,
    },
  },
  {
    tableName: "categories",
    underscored: true,
    timestamps: true,
  },
);

export default Category;
