import Cart from "./Cart";
import Category from "./Category";
import Order from "./Order";
import OrderItem from "./OrderItem";
import ProductCategory from "./ProductCategory";
import ProductImage from "./ProductImage";
import Product from "./ProductsModel";
import User from "./UserModel";
import Banner from "./Banner";


User.hasMany(Product, {
  as: "products",
  foreignKey: "userId",
});

Product.belongsTo(User, {
  as: "seller",
  foreignKey: "userId",
});


Product.belongsToMany(Category, {
  through: ProductCategory,
  as: "categories",
  foreignKey: "productId",
  otherKey: "categoryId",
});

Category.belongsToMany(Product, {
  through: ProductCategory,
  as: "products",
  foreignKey: "categoryId",
  otherKey: "productId",
});


Product.hasMany(ProductImage, {
  as: "images",
  foreignKey: "productId",
});

ProductImage.belongsTo(Product, {
  foreignKey: "productId",
});


Cart.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

Product.hasMany(Cart, {
  foreignKey: "productId",
  as: "carts",
});


User.hasMany(Order, {
  as: "orders",
  foreignKey: "userId",
});

Order.belongsTo(User, {
  as: "buyer",
  foreignKey: "userId",
});


Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "orderItems",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});


OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
});
