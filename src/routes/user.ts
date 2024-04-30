import express, { Router } from "express";
import { updateUser } from "../controllers/user";
const router: Router = express.Router();

router.put("/username", updateUser);

export default router;
