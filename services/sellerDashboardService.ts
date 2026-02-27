import { Request } from "express";
import Product from "../models/ProductsModel";
import ProductImage from "../models/ProductImage";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import User from "../models/UserModel";
import { Op } from "sequelize";
import sequelize from "../connections/db";

const sellerDashboardService = {
  getStats: async (req: Request) => {
    const sellerId = (req as any).user.id;

  
    const totalProducts = await Product.count({
      where: { userId: sellerId },
    });

   
    const sellerProducts = await Product.findAll({
      where: { userId: sellerId },
      attributes: ["id"],
    });
    const productIds = sellerProducts.map((p: any) => p.id);

    
    const orderStats = (await OrderItem.findAll({
      where: { productId: { [Op.in]: productIds } },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("OrderItem.id")), "totalOrders"],
        [sequelize.fn("SUM", sequelize.col("OrderItem.price")), "totalRevenue"],
      ],
      raw: true,
    })) as any[];

    const totalOrders = Number(orderStats[0]?.totalOrders) || 0;
    const totalRevenue = parseFloat(orderStats[0]?.totalRevenue) || 0;

    
    const pendingOrders = await Order.count({
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          where: { productId: { [Op.in]: productIds } },
          required: true,
        },
      ],
      where: { paymentStatus: "pending" },
    });

  
    const lowStockProducts = await Product.findAll({
      where: {
        userId: sellerId,
        stock: { [Op.lt]: 5 },
      },
      include: [{ model: ProductImage, as: "images", attributes: ["path"] }],
      attributes: ["id", "title", "stock", "price"],
    });

    const topRaw = (await OrderItem.findAll({
      where: { productId: { [Op.in]: productIds } },
      attributes: [
        "productId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
        [sequelize.fn("SUM", sequelize.col("OrderItem.price")), "totalRevenue"],
      ],
      group: ["productId"],
      order: [[sequelize.fn("SUM", sequelize.col("quantity")), "DESC"]],
      limit: 5,
      raw: true,
    })) as any[];

    const topProductIds = topRaw.map((r: any) => r.productId);
    const topProductDetails = await Product.findAll({
      where: { id: { [Op.in]: topProductIds } },
      include: [{ model: ProductImage, as: "images", attributes: ["path"] }],
      attributes: ["id", "title", "price"],
    });

    const topProducts = topRaw.map((r: any) => ({
      productId: r.productId,
      totalSold: Number(r.totalSold),
      totalRevenue: Number(r.totalRevenue),
      product: topProductDetails.find((p: any) => p.id == r.productId) ?? null,
    }));

    const recentOrders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          where: { productId: { [Op.in]: productIds } },
          required: true,
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      topProducts,
      recentOrders,
    };
  },
};

export default sellerDashboardService;
