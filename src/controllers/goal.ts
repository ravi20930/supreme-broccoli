import { Request, Response, NextFunction } from "express";
import { responseHandler, throwError } from "../utils/handler";
import { Category } from "../models/Goal";
import * as GoalService from "../services/goal";

export const createGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = req.user;
    const { title, description, targetCompletionDate, category } = req.body;
    if (!title || !description || !targetCompletionDate || !category) {
      throwError(400, "Missing required fields in the payload");
    }
    if (!Object.values(Category).includes(category)) {
      throwError(400, "Invalid category provided");
    }
    const goal = await GoalService.createGoal({
      title,
      description,
      targetCompletionDate,
      category,
      userId,
    });
    const response = responseHandler(200, "Goal created successfully.", goal);
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, targetCompletionDate, category, completed } =
      req.body;
    await GoalService.updateGoal(id, {
      title,
      description,
      targetCompletionDate,
      category,
      completed,
    });
    const response = responseHandler(200, "Goal updated successfully.");
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await GoalService.deleteGoal(id);
    const response = responseHandler(200, "Goal deleted successfully.");
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

export const markGoalCompleted = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await GoalService.markGoalCompleted(id);
    const response = responseHandler(
      200,
      "Goal marked as completed successfully."
    );
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

export const listUserGoals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 0;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 20;
    const { id: userId } = req.user;
    const goals = await GoalService.listUserGoals(userId, page, size);
    const response = responseHandler(
      200,
      "User goals retrieved successfully.",
      goals
    );
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

export const listPublicGoals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 0;
    const size = req.query.size ? parseInt(req.query.size as string, 10) : 20;
    const goals = await GoalService.listPublicGoals(page, size);
    const response = responseHandler(
      200,
      "Public goals retrieved successfully.",
      goals
    );
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};
