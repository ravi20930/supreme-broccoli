import { throwError } from "../utils/handler";
import { Goal, User } from "../models";
import { Category } from "../models/Goal";
import { getPagination, getPagingData } from "../utils/pagination";
import { Transaction } from "../config/database";

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
  isPublic: boolean;
}) => {
  return Goal.create(data);
};

export const updateGoal = async (
  t: Transaction,
  goalId: string,
  data: {
    title?: string;
    description?: string;
    targetCompletionDate?: Date;
    category?: Category;
    completed?: boolean;
    isPublic?: boolean;
  }
) => {
  const goal = await findGoalById(goalId);
  if (goal) {
    // check completed status
    const isCompletedUpdated =
      data.completed !== undefined && data.completed !== goal.completed;

    await goal.update(data, { transaction: t });

    if (isCompletedUpdated) {
      await updatePoints(t, goal, data.completed!); // update points based on the new completed status
    }
    return goal;
  }
};

export const deleteGoal = async (goalId: string) => {
  const goal = await findGoalById(goalId);
  if (goal) {
    await goal.destroy();
  }
};

const updatePoints = async (t: Transaction, goal: Goal, decrease: boolean) => {
  let pointsEarned = 0;
  switch (goal.category) {
    case Category.Health:
      pointsEarned = 10;
      break;
    case Category.Finance:
      pointsEarned = 20;
      break;
    case Category.PersonalGrowth:
      pointsEarned = 15;
      break;
    case Category.Career:
      pointsEarned = 25;
      break;
    case Category.Relationships:
      pointsEarned = 30;
      break;
    default:
      pointsEarned = 0;
      break;
  }

  // decrease is true, negate the pointsEarned
  if (!decrease) {
    console.log("decreasing...");
    pointsEarned *= -1;
  }
  console.log("increasing...");

  goal.pointsEarned += pointsEarned;
  await goal.save({ transaction: t });

  const user = await User.findByPk(goal.userId, { transaction: t });
  if (user) {
    const completedGoals = await Goal.findAll({
      where: {
        userId: goal.userId,
        completed: true,
      },
      attributes: ["pointsEarned"],
      transaction: t,
    });
    console.log(completedGoals);
    const totalPoints = completedGoals.reduce(
      (total, goal) => total + goal.pointsEarned,
      0
    );
    user.totalPoints = totalPoints;
    await user.save({ transaction: t });
  }
};

export const markGoalCompleted = async (t: Transaction, goalId: string) => {
  const goal = await findGoalById(goalId);
  if (goal && !goal.completed) {
    await goal.update({ completed: true }, { transaction: t });
    console.log("updating points.....");
    await updatePoints(t, goal, true);
  }
  console.log("already completed.....");
  return goal;
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
  const users = await User.findAndCountAll({
    attributes: ["username", "totalPoints"],
    include: [
      {
        model: Goal,
        as: "goals",
        where: { completed: true, isPublic: true },
        attributes: [
          "pointsEarned",
          "title",
          "description",
          "targetCompletionDate",
          "category",
        ],
      },
    ],
    limit,
    offset,
  });
  return getPagingData(users, page, limit);
};
