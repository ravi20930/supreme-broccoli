import { throwError } from "../utils/handler";
import { Goal, User } from "../models";
import { Category } from "../models/Goal";
import { getPagination, getPagingData } from "../utils/pagination";

const findGoalById = async (goalId: string) => {
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(goalId)) {
    throwError(400, "Invalid goal ID");
  }
  const goal = await Goal.findByPk(goalId);
  if (!goal) {
    throwError(404, "Goal not found");
  }
  return goal;
};

export const createGoal = async (data: {
  title: string;
  description: string;
  targetCompletionDate: Date;
  category: Category;
  userId: string;
}) => {
  return Goal.create(data);
};

export const updateGoal = async (
  goalId: string,
  data: {
    title?: string;
    description?: string;
    targetCompletionDate?: Date;
    category?: Category;
    completed?: boolean;
  }
) => {
  const goal = await findGoalById(goalId);
  if (goal) {
    return goal.update(data);
  }
};

export const deleteGoal = async (goalId: string) => {
  const goal = await findGoalById(goalId);
  if (goal) {
    await goal.destroy();
  }
};

export const markGoalCompleted = async (goalId: string) => {
  const goal = await findGoalById(goalId);
  if (goal) {
    return goal.update({ completed: true });
  }
};

export const listUserGoals = async (
  userId: string,
  page: number,
  size: number
) => {
  const { limit, offset } = getPagination(page, size);
  const goals = await Goal.findAndCountAll({
    where: { userId },
    limit,
    offset,
  });
  return getPagingData(goals, page, limit);
};

export const listPublicGoals = async (page: number, size: number) => {
  const { limit, offset } = getPagination(page, size);
  const goals = await Goal.findAndCountAll({
    where: { completed: false },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["username"],
      },
    ],
    limit,
    offset,
  });
  return getPagingData(goals, page, limit);
};
