import { Request } from "express";
import Product from "../models/ProductsModel";
import User from "../models/UserModel";
import Category from "../models/Category";
import { Op } from "sequelize";
import ProductImage from "../models/ProductImage";
import sequelize from "../connections/db";
import Cart from "../models/Cart";
import OrderItem from "../models/OrderItem";
import cloudinary from "../config/cloudinary";

const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "ecommerce" }, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      })
      .end(file.buffer);
  });
};

const deleteFromCloudinary = async (imageUrl: string) => {
  try {
    const parts = imageUrl.split("/");
    const filename = parts.at(-1)?.split(".")[0];
    const folder = parts.at(-2);

    if (!filename || !folder) {
      console.error("Invalid Cloudinary URL:", imageUrl);
      return;
    }

    const publicId = `${folder}/${filename}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Failed to delete image from Cloudinary:", err);
  }
};

const productService = {
  get: async (req: Request) => {
    let searchText: string = (req.query.q as string)?.trim() || "";
    let priceFrom: number = (req.query.priceFrom as unknown as number) || 0;
    let priceTo: number =
      (req.query.priceTo as unknown as number) || 999999999999;
    let page: number = (req.query.page as unknown as number) || 1;
    let limit: number = (req.query.limit as unknown as number) || 10;
    let offset = (page - 1) * limit;

    let categoryIds: number[] | undefined;
    if (req.query.categoryId) {
      const raw = req.query.categoryId;
      if (Array.isArray(raw)) {
        categoryIds = (raw as string[]).map(Number);
      } else {
        categoryIds = [Number(raw)];
      }
    }

    let order: [string, string] = ["title", "ASC"];
    let sortBy: string = req.query.sort as string;
    switch (sortBy) {
      case "priceAsc":
        order = ["price", "ASC"];
        break;
      case "priceDesc":
        order = ["price", "DESC"];
        break;
      case "titleAsc":
        order = ["title", "ASC"];
        break;
      case "titleDesc":
        order = ["title", "DESC"];
        break;
    }

    return await Product.findAndCountAll({
      include: [
        { model: User, as: "seller", attributes: ["id"] },
        {
          model: Category,
          as: "categories",
          attributes: ["id", "title"],
          ...(categoryIds &&
            categoryIds.length > 0 && {
              where: { id: { [Op.in]: categoryIds } },
              required: true,
            }),
        },
        { model: ProductImage, as: "images", attributes: ["path"] },
      ],
      where: {
        title: { [Op.iLike]: `%${searchText}%` },
        price: { [Op.gte]: priceFrom, [Op.lte]: priceTo },
      },
      limit,
      offset,
      order: [order],
      distinct: true,
    });
  },

  getSingleProduct: async (req: Request) => {
    let id = req.params.id as unknown as number;
    return await Product.findByPk(id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        { model: Category, as: "categories", attributes: ["id", "title"] },
        { model: ProductImage, as: "images", attributes: ["id", "path"] },
      ],
      attributes: { exclude: ["userId", "updatedAt"] },
    });
  },

  getSellerProducts: async (req: Request) => {
    return await Product.findAll({
      where: { userId: (req as any).user.id },
      include: [{ model: ProductImage, as: "images", attributes: ["path"] }],
    });
  },

  deleteSellerProduct: async (productId: string, userId: number) => {
    const transaction = await sequelize.transaction();
    try {
      const product = await Product.findOne({
        where: { id: productId, userId },
        transaction,
      });

      if (!product) throw new Error("Product not found");

      const cartItems = await Cart.findAll({
        where: { productId },
        transaction,
      });
      if (cartItems.length > 0) {
        throw new Error(
          "Cannot delete this product because it is currently in customers' carts.",
        );
      }

      const orderedItems = await OrderItem.findAll({
        where: { productId },
        transaction,
      });
      if (orderedItems.length > 0) {
        throw new Error(
          "Cannot delete this product because it has existing order history.",
        );
      }

      const images = await ProductImage.findAll({
        where: { productId },
        transaction,
      });
      for (const image of images as any[]) {
        await deleteFromCloudinary(image.path);
      }

      await ProductImage.destroy({ where: { productId }, transaction });
      await product.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  updateSellerProduct: async (
    productId: string,
    userId: number,
    body: any,
    files?: Express.Multer.File[],
  ) => {
    const product = await Product.findOne({ where: { id: productId, userId } });
    if (!product) throw new Error("Product not found");

    await product.update({
      title: body.title,
      price: body.price,
      stock: body.stock,
      shortDescription: body.shortDescription,
      description: body.description,
    });

    const raw = body["categoryIds[]"] ?? body.categoryIds;
    if (raw) {
      const categoryIds = Array.isArray(raw) ? raw.map(Number) : [Number(raw)];
      // @ts-ignore
      await product.setCategories(categoryIds);
    }

    if (body.deletedImageIds) {
      const deletedIds = JSON.parse(body.deletedImageIds);
      const imagesToDelete = await ProductImage.findAll({
        where: { id: deletedIds, productId },
      });

      for (const image of imagesToDelete as any[]) {
        await deleteFromCloudinary(image.path);
      }

      await ProductImage.destroy({ where: { id: deletedIds } });
    }

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const cloudinaryUrl = await uploadToCloudinary(file);
        return ProductImage.create({
          productId: product.getDataValue("id"),
          path: cloudinaryUrl,
        });
      });
      await Promise.all(uploadPromises);
    }
  },

  create: async (req: Request) => {
    const product = await Product.create({
      title: req.body.title,
      price: req.body.price,
      userId: (req as any).user.id,
      stock: req.body.stock,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
    });

    // @ts-ignore
    await product.addCategories(req.body.categoryIds);

    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const cloudinaryUrl = await uploadToCloudinary(file);
        return ProductImage.create({
          productId: product.getDataValue("id"),
          path: cloudinaryUrl,
        });
      });
      await Promise.all(uploadPromises);
    }

    return product;
  },
};

export default productService;
