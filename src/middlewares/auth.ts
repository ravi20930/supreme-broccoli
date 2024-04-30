import { Request, Response, NextFunction } from "express";
import { Group, User, UserGroup } from "../models";
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

/**
 * Middleware to verify if the user is an admin.
 */
export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) {
      throwError(401, "Token not provided");
    }
    const token = req.headers.authorization?.split(" ")[1] || "";
    const decoded: any = verify(token, JWT_ACCESS_SECRET || "");
    const user = await User.findOne({
      where: { id: decoded.id },
      include: [
        {
          model: UserGroup,
          as: "userGroup",
          attributes: ["id"],
          required: true,
          include: [
            {
              model: Group,
              as: "group",
              where: { name: "ADMIN" },
              attributes: ["name"],
              required: true,
            },
          ],
        },
      ],
    });
    if (user) {
      req.user = getUserReqObject(user);
    } else throwError(404, "Account not found or access denied");
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
