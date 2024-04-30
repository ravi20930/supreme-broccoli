import { Request, Response, NextFunction } from "express";
import { log, error } from "../utils/logger";
import { responseHandler, throwError } from "../utils/handler";
import { updateUserUsername } from "../services/user";

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.user;
    const { newUsername } = req.body;

    if (!newUsername) {
      throwError(400, "New username is required");
    }

    const user = await updateUserUsername(userId, newUsername);

    const response = responseHandler(
      200,
      "Username updated successfully.",
      user
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
