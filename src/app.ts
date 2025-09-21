import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./error";
import { connectDB } from "../db";
import { roleController } from "./module/v1/role/controller/roleController";
import { userController } from "./module/v1/user/controller/userController";
import { config } from "./config";

dotenv.config();

const app: Express = express();

app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(cookieParser());
// CORS configuration
app.use(
  cors({
    origin: config.ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ message: `API is up and running.` });
});

// connect to database
connectDB();

const v1controllers = [roleController, userController];

v1controllers.forEach((controller) => app.use("/api/v1", controller.router));

app.use(errorHandler);

export default app;
