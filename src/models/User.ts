import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id?: string;
  username?: string | null;
  phone?: string | null;
  email?: string;
  googleId: string | null;
  totalPoints: number;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;

  public username!: string | null;

  public phone!: string | null;

  public email!: string;

  public googleId!: string | null;

  public totalPoints!: number;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

export default User;
