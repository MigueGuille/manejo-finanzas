import { ZodError } from "zod";
import { AppError } from "../utils/apiResponse.js";

export const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation error",
      data: error.flatten()
    });
  }

  const status = error instanceof AppError ? error.status : 500;
  const message = status === 500 ? "Internal server error" : error.message;

  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json({
    success: false,
    message,
    data: error.details || null
  });
};

