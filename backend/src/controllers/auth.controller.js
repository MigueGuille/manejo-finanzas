import { authService } from "../services/auth.service.js";
import { created, ok } from "../utils/apiResponse.js";

export const authController = {
  register: async (req, res) => created(res, await authService.register(req.body), "Account created"),
  login: async (req, res) => ok(res, await authService.login(req.body), "Logged in"),
  refresh: (req, res) => ok(res, authService.refresh(req.body.refreshToken), "Token refreshed")
};

