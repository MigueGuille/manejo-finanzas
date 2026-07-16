import { snapshotService } from "../services/snapshot.service.js";

export const ensurePeriodSnapshot = async (req, _res, next) => {
  if (!req.user?.id) return next();
  try {
    await snapshotService.ensurePreviousPeriodSnapshot(req.user.id);
    next();
  } catch (error) {
    next(error);
  }
};

