import bcrypt from "bcrypt";
import { throwError } from "../utils/handler";
import { User } from "../models";

export const profile = async (userId: string) => {
  return User.findByPk(userId, { attributes: ["username", "id"] });
};

export const findOrCreateByGoogleId = async (
  googleId: string,
  email: string
): Promise<User> => {
  let user = await User.findOne({ where: { googleId } });

  if (!user) {
    user = User.build({
      googleId,
      email,
    });
    await user.save();
  }

  return user;
};

export const createByUname = async (email: string, password: string) => {
  let user = await User.findOne({ where: { email } });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = User.build({
      email,
      password: hashedPassword,
    });
    await user.save();
  } else {
    throwError(409, "User with the provided email already exists.");
  }
};

export const checkPassword = async (
  email: string,
  password: string
): Promise<{ user: User | null; passwordMatch: boolean }> => {
  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    return { user: null, passwordMatch: false };
  }
  if (!user.password) {
    return { user: null, passwordMatch: false };
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  return { user, passwordMatch };
};

export const updateUserUsername = async (
  userId: string,
  newUsername: string
) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throwError(404, "User not found");
  }
  const existingUser = await User.findOne({ where: { username: newUsername } });
  if (existingUser && existingUser.id !== userId) {
    throwError(409, "Username is already taken");
  }

  user!.username = newUsername;
  await user!.save();
  return user;
};
