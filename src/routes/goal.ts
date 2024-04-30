// Goal routes
import express, { Router } from "express";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  markGoalCompleted,
  listUserGoals,
  listPublicGoals,
} from "../controllers/goal";

const router: Router = express.Router();

router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);
router.put("/:id/complete", markGoalCompleted);
router.get("/", listUserGoals);
router.get("/public", listPublicGoals);

export default router;
