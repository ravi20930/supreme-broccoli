import express, { Router } from "express";
import userRoutes from "./user";
import authRoutes from "./auth";
import goalRoutes from "./goal";
import { verifyAccessToken } from "../middlewares/auth";

const router: Router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", verifyAccessToken, userRoutes);
router.use("/goal", verifyAccessToken, goalRoutes);

export default router;
