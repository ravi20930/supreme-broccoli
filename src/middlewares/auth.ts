import { Request, Response, NextFunction } from "express";
import { User } from "../models";
import { getUserReqObject, verify } from "../utils/auth";
import { throwError } from "../utils/handler";

const { JWT_ACCESS_SECRET, NODE_ENV } = process.env;

/**
 * Middleware to verify the access token provided in the request headers.
 */
export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) {
      throwError(401, "Token not provided");
    }
    const token = req.headers.authorization?.split(" ")[1] || ""; // Add a default value of an empty string
    const decoded: any = verify(token, JWT_ACCESS_SECRET || "");

    const user = await User.findOne({
      where: { id: decoded.id },
      attributes: ["id", "googleId"],
    });
    if (user) {
      req.user = getUserReqObject(user);
    } else throwError(404, "Account not found or access denied");
    if (NODE_ENV === "development") {
      console.log({ user: req.user });
    }
    next();
  } catch (err) {
    if ((err as { name: string }).name === "TokenExpiredError") {
      return next(throwError(401, "Token expired"));
    }
    if ((err as { name: string }).name === "JsonWebTokenError") {
      return next(throwError(401, "Invalid token"));
    }
    next(err);
  }
};
