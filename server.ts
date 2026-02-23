import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./connections/db";
import appRoutes from "./routes/index";
import "./models/index";
import errorHandler from "./middlewares/errorHandlers";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",

    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());
app.use(cookieParser());

let isDbConnected = false;

const connectDB = async () => {
  if (!isDbConnected) {
    await sequelize.authenticate();

    isDbConnected = true;
    console.log("✅ Database connected");
  }
};

connectDB();

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

app.use("/api", appRoutes);

app.use(errorHandler);

export default app;
