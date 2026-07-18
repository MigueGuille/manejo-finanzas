import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/apiResponse.js";

export const userService = {
  async settings(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, currency: true, bankBalanceBs: true, periodType: true, biweeklyConfig: true }
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
  updateSettings(userId, data) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, currency: true, bankBalanceBs: true, periodType: true, biweeklyConfig: true }
    });
  }
};
