import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import approutes from "./routes/index";
import cookieParser from "cookie-parser";
import "./models/index";
import sequelize from "./connections/db";
import cloudinary from "./config/cloudinary";
import ProductImage from "./models/ProductImage";

const app = express();

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://ecommerce-frontend-six-teal.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api", approutes);

const PORT = process.env.PORT || 8001;

const migrateImagesToWebp = async () => {
  const images = await ProductImage.findAll();

  for (const image of images as any[]) {
    const oldPath: string = image.path;
    if (oldPath.includes("f_webp") || oldPath.endsWith(".webp")) continue;

    const newPath = oldPath
      .replace("/image/upload/", "/image/upload/f_webp,q_auto/")
      .replace(/\.(jpg|jpeg|png)$/, ".webp");

    await image.update({ path: newPath });
    console.log(`Updated: ${oldPath} → ${newPath}`);
  }

  console.log("Migration complete ✅");
};

const checkConnectionDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await migrateImagesToWebp();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

checkConnectionDB();

export default app;
