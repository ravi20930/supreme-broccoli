import { throwError } from "../utils/handler";
import { User } from "../models";

export const profile = async (userId: string) => {
  return User.findByPk(userId);
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
