import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import approutes from "./routes/index";
import cookieParser from "cookie-parser";
import "./models/index";
import sequelize from "./connections/db";
import cloudinary from "./config/cloudinary";

const app = express();

app.use(
  cors({
    origin:process.env.FRONTEND_URL || "https://ecommerce-frontend-six-teal.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api", approutes);

const PORT = process.env.PORT || 8001;

const checkConnectionDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

checkConnectionDB();

export default app;
