import Cart from "../models/Cart";
import ProductImage from "../models/ProductImage";
import Product from "../models/ProductsModel";
import User from "../models/UserModel";

const cartService = {
  addToCart: async (userId: number, productId: number) => {
    const existingCartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingCartItem) {
      await existingCartItem.update({
        quantity: existingCartItem.getDataValue("quantity") + 1,
      });
    } else {
      await Cart.create({
        userId,
        productId,
        quantity: 1,
      });
    }
  },

  updateCart: async (cartId: number, quantity: number) => {
    const existingCartItem = await Cart.findByPk(cartId);
    if (!existingCartItem) throw new Error("Cart item not found");

    await existingCartItem.update({ quantity });
  },

  deleteCart: async (cartId: number) => {
    const existingCartItem = await Cart.findByPk(cartId);
    if (!existingCartItem) throw new Error("Cart item not found");

    await existingCartItem.destroy();
  },

  getCart: async (userId: number) => {
    return await Cart.findAll({
      where: { userId },
      include: {
        model: Product,
        as: "product",
        include: [
          {
            model: User,
            as: "seller",
            attributes: ["id", "firstName"],
          },
          {
            model: ProductImage, // ✅ ADD THIS
            as: "images", // ✅ MUST MATCH YOUR ASSOCIATION
            attributes: ["path"],
          },
        ],
      },
    });
  },
};

export default cartService;
