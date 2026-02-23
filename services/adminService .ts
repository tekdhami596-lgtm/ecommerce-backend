import User from "../models/UserModel";
import Product from "../models/ProductsModel";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Category from "../models/Category";
import ProductImage from "../models/ProductImage";
import Cart from "../models/Cart";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";

const adminService = {
  // ─── Dashboard Stats ───────────────────────────────────────
  getStats: async () => {
    const [totalUsers, totalSellers, totalProducts, totalOrders] =
      await Promise.all([
        User.count({ where: { role: "buyer" } }),
        User.count({ where: { role: "seller" } }),
        Product.count(),
        Order.count(),
      ]);

    // Revenue = sum of (price * quantity) across all order items
    const orderItems = (await OrderItem.findAll({ raw: true })) as any[];
    const totalRevenue = orderItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price || 0) * Number(item.quantity || 1),
      0,
    );

    const recentOrders = await Order.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["firstName", "lastName", "email"],
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            { model: Product, as: "product", attributes: ["title", "price"] },
          ],
        },
      ],
    });

    // Pending sellers — role === "seller" (no status column, so just list all sellers)
    const pendingSellers = await User.findAll({
      where: { role: "seller" },
      limit: 5,
      order: [["created_at", "DESC"]],
      attributes: ["id", "firstName", "lastName", "email", "createdAt"],
    });

    return {
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      pendingSellers,
    };
  },

  // ─── Users ─────────────────────────────────────────────────
  getAllUsers: async (search?: string, role?: string) => {
    const where: any = {};
    if (role && role !== "all") where.role = role;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    return User.findAll({
      where,
      attributes: ["id", "firstName", "lastName", "email", "role", "createdAt"],
      order: [["created_at", "DESC"]],
    });
  },

  deleteUser: async (id: number) => {
    const user = (await User.findByPk(id)) as any;
    if (!user) throw { status: 404, message: "User not found" };
    if (user.role === "admin")
      throw { status: 403, message: "Cannot delete admin" };
    await user.destroy();
    return { message: "User deleted" };
  },

  // ─── Sellers ───────────────────────────────────────────────
  getSellers: async () => {
    return User.findAll({
      where: { role: "seller" },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "storeName",
        "businessAddress",
        "createdAt",
      ],
      order: [["created_at", "DESC"]],
    });
  },

  deleteSeller: async (id: number) => {
    const seller = (await User.findOne({
      where: { id, role: "seller" },
    })) as any;
    if (!seller) throw { status: 404, message: "Seller not found" };
    await seller.destroy();
    return { message: "Seller deleted" };
  },

  // ─── Products ──────────────────────────────────────────────
  getAllProducts: async (search?: string) => {
    const where: any = {};
    if (search) where.title = { [Op.like]: `%${search}%` };
    return Product.findAll({
      where,
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "firstName", "lastName"],
        },
        { model: ProductImage, as: "images", limit: 1 },
        {
          model: Category,
          as: "categories",
          attributes: ["id", "title"],
          through: { attributes: [] },
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  deleteProduct: async (id: number) => {
    const product = await Product.findByPk(id);
    if (!product) throw { status: 404, message: "Product not found" };

    // ── Block if product is in any customer's cart ────────────
    const cartItems = await Cart.findAll({ where: { productId: id } });
    if (cartItems.length > 0) {
      throw {
        status: 400,
        message:
          "Cannot delete this product because it is currently in customers' carts.",
      };
    }

    // ── Block if product has order history ────────────────────
    const orderedItems = await OrderItem.findAll({ where: { productId: id } });
    if (orderedItems.length > 0) {
      throw {
        status: 400,
        message:
          "Cannot delete this product because it has existing order history.",
      };
    }

    // ── Delete product images from disk ───────────────────────
    const images = await ProductImage.findAll({ where: { productId: id } });
    for (const image of images as any[]) {
      const imagePath = path.join(__dirname, "..", image.path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await ProductImage.destroy({ where: { productId: id } });

    await product.destroy();
    return { message: "Product deleted" };
  },

  // ─── Orders ────────────────────────────────────────────────
  getAllOrders: async (paymentStatus?: string) => {
    const where: any = {};
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = paymentStatus;
    }
    return Order.findAll({
      where,
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "title", "price"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
  },

  updatePaymentStatus: async (id: number, paymentStatus: string) => {
    const order = (await Order.findByPk(id)) as any;
    if (!order) throw { status: 404, message: "Order not found" };
    await order.update({ paymentStatus });
    return order;
  },
};

export default adminService;
