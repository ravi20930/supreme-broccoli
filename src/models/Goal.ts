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

interface GoalAttributes {
  id?: string;
  title: string;
  description: string;
  targetCompletionDate: Date;
  category: Category;
  completed?: boolean;
  userId: string;
}

class Goal extends Model<GoalAttributes> implements GoalAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public targetCompletionDate!: Date;
  public category!: Category;
  public completed!: boolean;
  public userId!: string;
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
  },
  {
    sequelize,
    modelName: "Goal",
  }
);

export default Goal;
