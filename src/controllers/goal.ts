import { Request, Response, NextFunction } from "express";
import { responseHandler, throwError } from "../utils/handler";
import { Category } from "../models/Goal";
import * as GoalService from "../services/goal";
import { getTransaction } from "../config/database";

export const createGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: userId } = req.user;
    const {
      title,
      description,
      targetCompletionDate,
      category,
      isPublic,
      recurring,
      recurrenceFrequency,
      recurrenceStartDate,
      recurrenceEndDate,
    } = req.body;
    if (!title || !description || !targetCompletionDate || !category) {
      throwError(400, "Missing required fields in the payload");
    }
    if (!Object.values(Category).includes(category)) {
      throwError(400, "Invalid category provided");
    }
    if (recurring) {
      if (!recurrenceFrequency || !recurrenceStartDate || !recurrenceEndDate) {
        throwError(400, "Missing required recurring parameters");
      }
    }
    const goal = await GoalService.createGoal({
      title,
      description,
      targetCompletionDate,
      category,
      userId,
      isPublic,
      recurring,
      recurrenceFrequency,
      recurrenceStartDate,
      recurrenceEndDate,
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
  const t = await getTransaction();
  try {
    const { id } = req.params;
    const {
      title,
      description,
      targetCompletionDate,
      category,
      isPublic,
      recurring,
      recurrenceFrequency,
      recurrenceStartDate,
      recurrenceEndDate,
    } = req.body;

    const goal = await GoalService.findGoalById(id);
    const isRecurringUpdated =
      recurring !== undefined && recurring !== goal!.recurring && recurring;

    if (isRecurringUpdated) {
      if (!recurrenceFrequency || !recurrenceStartDate || !recurrenceEndDate) {
        throwError(400, "Missing required recurring parameters");
      }
    }

    await GoalService.updateGoal(t, goal!, req.body);
    await t.commit();
    const response = responseHandler(200, "Goal updated successfully.");
    res.status(response.statusCode).json(response);
  } catch (err) {
    t.rollback();
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
  const t = await getTransaction();
  try {
    const { id } = req.params;
    const isCompleteParam = req.query.isComplete as string | undefined;
    const isCompleted = isCompleteParam
      ? isCompleteParam.toLowerCase() === "true" || isCompleteParam === "1"
      : undefined;
    console.log(isCompleted, "========================");
    const goal = await GoalService.markGoalCompleted(t, id, isCompleted);
    const response = responseHandler(
      200,
      "Goal marked as completed successfully.",
      goal
    );
    await t.commit();
    res.status(response.statusCode).json(response);
  } catch (err) {
    t.rollback();
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
