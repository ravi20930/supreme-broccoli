import express, { Router } from "express";
import {
  googleLogin,
  googleSignInCallback,
  normalSignIn,
  signUp,
} from "../controllers/auth";

const router: Router = express.Router();

router.post("/google/login", googleLogin);
router.get("/google/callback", googleSignInCallback);

router.post("/signup", signUp);
router.post("/signin", normalSignIn);

export default router;
