import { getUserReqObject } from "../utils/auth";

declare global {
  namespace Express {
    interface Request {
      user: ReturnType<typeof getUserReqObject>;
    }
  }
}
