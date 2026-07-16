import { userService } from "../services/user.service.js";
import { ok } from "../utils/apiResponse.js";

export const userController = {
  settings: async (req, res) => ok(res, await userService.settings(req.user.id)),
  updateSettings: async (req, res) => ok(res, await userService.updateSettings(req.user.id, req.body), "Settings updated")
};

