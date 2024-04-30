import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

interface UserAttributes {
  id?: string;
  username?: string | null;
  phone?: string | null;
  email?: string;
  googleId: string | null;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;

  public username!: string | null;

  public phone!: string | null;

  public email!: string;

  public googleId!: string | null;
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
  },
  {
    sequelize,
    modelName: "User",
  }
);

export default User;
