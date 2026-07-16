import { prisma } from "../config/prisma.js";

export const categoryRepository = {
  findAll(userId) {
    return prisma.category.findMany({ where: { userId }, orderBy: [{ type: "asc" }, { name: "asc" }] });
  },
  findById(userId, id) {
    return prisma.category.findFirst({ where: { id, userId } });
  },
  create(userId, data) {
    return prisma.category.create({ data: { ...data, userId } });
  },
  update(userId, id, data) {
    return prisma.category.update({ where: { id }, data });
  },
  remove(userId, id) {
    return prisma.category.delete({ where: { id } });
  }
};
