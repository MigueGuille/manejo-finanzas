import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/apiResponse.js";

const signTokens = (user) => ({
  accessToken: jwt.sign({ email: user.email }, env.accessSecret, {
    subject: user.id,
    expiresIn: env.accessExpiresIn
  }),
  refreshToken: jwt.sign({ email: user.email }, env.refreshSecret, {
    subject: user.id,
    expiresIn: env.refreshExpiresIn
  })
});

export const authService = {
  async register(data) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("Email already registered", 409);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: await bcrypt.hash(data.password, 12),
        currency: data.currency || env.defaultCurrency
      },
      select: { id: true, email: true, currency: true, periodType: true, biweeklyConfig: true }
    });

    return { user, ...signTokens(user) };
  },
  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError("Invalid credentials", 401);
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      currency: user.currency,
      periodType: user.periodType,
      biweeklyConfig: user.biweeklyConfig
    };

    return { user: safeUser, ...signTokens(user) };
  },
  refresh(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, env.refreshSecret);
      const user = { id: payload.sub, email: payload.email };
      return signTokens(user);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  }
};

