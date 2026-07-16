export const ok = (res, data = null, message = "OK", status = 200) =>
  res.status(status).json({ success: true, message, data });

export const created = (res, data = null, message = "Created") => ok(res, data, message, 201);

export class AppError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

