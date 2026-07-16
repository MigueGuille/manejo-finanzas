import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/apiResponse.js";

export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Missing access token", 401);
  }

  try {
    const payload = jwt.verify(header.slice(7), env.accessSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
};

