import { Request, Response, NextFunction } from "express";
import { log, error } from "../utils/logger";
import { responseHandler, throwError } from "../utils/handler";
import { generateOAuthClient, generateOAuthUrl } from "../config/google";
import { generateToken } from "../utils/auth";
import {
  checkPassword,
  createByUname,
  findOrCreateByGoogleId,
} from "../services/user";
// const { GOOGLE_AUTH_SUCCESS_URL } = process.env;

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  try {
    const scopes: string[] = [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ];
    const authUrl = generateOAuthUrl({
      state: "null",
      scopes,
    });
    const response = responseHandler(200, "Google auth URL.", authUrl);
    return res.status(response.statusCode).json(response);
  } catch (err) {
    error(req, err);
    next(err);
  }
};

export const googleSignInCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.query;

    const { tokens } = await generateOAuthClient().getToken(code as string);

    // Get user info from Google
    const userInfo = await generateOAuthClient().getTokenInfo(
      tokens.access_token ?? ""
    );
    console.log("userInfo", userInfo);

    const user = await findOrCreateByGoogleId(
      userInfo.sub ?? "",
      userInfo.email ?? ""
    );

    const token = generateToken(user, "access");

    const response = responseHandler(200, "Google sign in successful.", {
      token,
    });
    res.status(response.statusCode).json(response);
  } catch (err) {
    error(req, err);
    next(err);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throwError(400, "Username and password are required");
    }
    await createByUname(email, password);
    const response = responseHandler(200, "User successfully created.");
    res.status(response.statusCode).json(response);
  } catch (err) {
    next(err);
  }
};

export const normalSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if the username and password are provided
    if (!email || !password) {
      throwError(400, "Email and password are required");
    }
    const { user, passwordMatch } = await checkPassword(email, password);
    if (!passwordMatch) {
      throwError(401, "Invalid username or password");
    }
    const token = generateToken(user!, "access");
    const response = responseHandler(200, "Sign in successful.", {
      token,
    });
    res.status(response.statusCode).json(response);
  } catch (err) {
    error(req, err);
    next(err);
  }
};
