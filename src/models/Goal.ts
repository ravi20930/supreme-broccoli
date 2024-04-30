import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";

export enum Category {
  Health = "Health",
  Finance = "Finance",
  PersonalGrowth = "Personal Growth",
  Career = "Career",
  Relationships = "Relationships",
}

export enum RecurrenceFrequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
}

interface GoalAttributes {
  id?: string;
  title: string;
  description: string;
  targetCompletionDate: Date;
  category: Category;
  completed?: boolean;
  userId: string;
  pointsEarned?: number;
  isPublic?: boolean;
  recurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceStartDate?: Date;
  recurrenceEndDate?: Date;
}

class Goal extends Model<GoalAttributes> implements GoalAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public targetCompletionDate!: Date;
  public category!: Category;
  public completed!: boolean;
  public userId!: string;
  public pointsEarned!: number;
  public isPublic!: boolean;
  public recurring!: boolean;
  public recurrenceFrequency!: RecurrenceFrequency;
  public recurrenceStartDate!: Date;
  public recurrenceEndDate!: Date;
}

Goal.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    targetCompletionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [Object.values(Category)],
      },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    recurrenceFrequency: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [Object.values(RecurrenceFrequency)],
      },
    },
    recurrenceStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    recurrenceEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Goal",
  }
);

export default Goal;
