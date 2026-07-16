import { reportService } from "../services/report.service.js";

export const reportController = {
  export: async (req, res) => {
    const file = await reportService.export(req.user.id, req.query);
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.send(file.body);
  }
};

