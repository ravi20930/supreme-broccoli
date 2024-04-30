import User from "./User";
import Goal from "./Goal";

User.hasMany(Goal, { foreignKey: "userId", as: "goals" });
Goal.belongsTo(User, { foreignKey: "userId", as: "user" });

export { User, Goal };
