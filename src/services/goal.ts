import { isSameDay } from "date-fns";
import { throwError } from "../utils/handler";
import { Goal, User } from "../models";
import { Category, RecurrenceFrequency } from "../models/Goal";
import { getPagination, getPagingData } from "../utils/pagination";
import { Transaction, getOp } from "../config/database";

export const findGoalById = async (goalId: string) => {
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
  recurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceStartDate?: Date;
  recurrenceEndDate?: Date;
}) => {
  return Goal.create(data);
};

export const updateGoal = async (
  t: Transaction,
  goal: Goal,
  data: {
    title?: string;
    description?: string;
    targetCompletionDate?: Date;
    category?: Category;
    isPublic?: boolean;
    recurring?: boolean;
    recurrenceFrequency?: RecurrenceFrequency;
    recurrenceStartDate?: Date;
    recurrenceEndDate?: Date;
  }
) => {
  await goal.update(data, { transaction: t });
  return goal;
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
  } else console.log("increasing...");

  goal.pointsEarned += pointsEarned;
  await goal.save({ transaction: t });

  const user = await User.findByPk(goal.userId, { transaction: t });
  if (user) {
    const completedGoals = await Goal.findAll({
      where: {
        userId: goal.userId,
        // completed: true,
        pointsEarned: {
          [getOp().gt]: 0,
        },
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

const handleRecurringGoalCompletion = async (
  goal: Goal,
  t: Transaction,
  wheel: boolean = true
) => {
  const {
    recurrenceFrequency,
    targetCompletionDate,
    recurrenceStartDate,
    recurrenceEndDate,
  } = goal;

  const today = new Date();
  if (today < new Date(recurrenceStartDate)) {
    throwError(400, "Recurring goal start date has not arrived yet.");
  }
  //   if (recurrenceEndDate && new Date() > new Date(recurrenceEndDate)) {
  //     throwError(400, "Recurring goal end date has been reached.");
  //   }

  if (wheel) {
    // move to the next occurrence
    const nextOccurrence = calculateNextOccurrence(
      recurrenceFrequency,
      targetCompletionDate || recurrenceStartDate
    );

    if (nextOccurrence) {
      if (recurrenceEndDate && nextOccurrence > new Date(recurrenceEndDate)) {
        goal.completed = true; // mark as completed if next occurrence exceeds end date
      } else {
        goal.targetCompletionDate = nextOccurrence;
      }
    } else {
      throwError(400, "Next occurrence cannot be calculated.");
    }
  } else {
    // move to the previous occurrence
    let previousDate = new Date(targetCompletionDate || recurrenceStartDate);
    switch (recurrenceFrequency) {
      case RecurrenceFrequency.Daily:
        previousDate.setDate(previousDate.getDate() - 1);
        break;
      case RecurrenceFrequency.Weekly:
        previousDate.setDate(previousDate.getDate() - 7);
        break;
      case RecurrenceFrequency.Monthly:
        previousDate.setMonth(previousDate.getMonth() - 1);
        break;
      default:
        break;
    }
    goal.targetCompletionDate = previousDate;
    goal.completed = false; // revert to incomplete
  }

  await goal.save({ transaction: t });
  return goal;
};

const calculateNextOccurrence = (
  frequency: RecurrenceFrequency,
  lastCompletionDate: Date
): Date | null => {
  const nextOccurrence = new Date(lastCompletionDate);

  switch (frequency) {
    case RecurrenceFrequency.Daily:
      nextOccurrence.setDate(nextOccurrence.getDate() + 1);
      break;
    case RecurrenceFrequency.Weekly:
      nextOccurrence.setDate(nextOccurrence.getDate() + 7);
      break;
    case RecurrenceFrequency.Monthly:
      nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
      // adjust the date to the last day of the month
      nextOccurrence.setDate(
        new Date(
          nextOccurrence.getFullYear(),
          nextOccurrence.getMonth() + 1,
          0
        ).getDate()
      );
      break;
  }
  return nextOccurrence;
};

export const markGoalCompleted = async (
  t: Transaction,
  goalId: string,
  complete: boolean = true
) => {
  let goal = await findGoalById(goalId);

  if (goal!.recurring) {
    // complete is wheel for moving days annd points forward backward for a reccurring goal
    goal = await handleRecurringGoalCompletion(goal!, t, complete);
    if (!complete && !goal!.completed) {
      // subtract points if latest goal is undone in reccuring goal
      console.log("subtracting points...");
      await updatePoints(t, goal!, false);
    } else if (complete && !goal.completed) {
      // add points if completing a recurring goal
      console.log("adding points...");
      await updatePoints(t, goal!, true);
    }
  } else {
    if (!complete && goal!.completed) {
      // marking goal as incomplete
      await goal!.update({ completed: false }, { transaction: t });
      console.log("subtracting points...");
      await updatePoints(t, goal!, false);
    } else if (complete && !goal!.completed) {
      // marking goal as completed
      await goal!.update({ completed: true }, { transaction: t });
      console.log("adding points...");
      await updatePoints(t, goal!, true);
    }
  }
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
