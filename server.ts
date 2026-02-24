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
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use("/api", approutes);

const PORT = process.env.PORT || 8001;

const checkConnectionDB = async () => {
  try {
    await sequelize.authenticate();

    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

checkConnectionDB();
