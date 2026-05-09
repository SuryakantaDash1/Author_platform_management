import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import CalculatorConfig from '../models/CalculatorConfig.model';

export class CalculatorController {
  // Public — no auth required
  static getPublicConfig = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const config = await CalculatorConfig.findOne().sort({ updatedAt: -1 });
      res.status(200).json({ success: true, data: { config } });
    }
  );

  // Admin — get current config for editing
  static getAdminConfig = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const config = await CalculatorConfig.findOne().sort({ updatedAt: -1 });
      res.status(200).json({ success: true, data: { config } });
    }
  );

  // Admin — upsert full config
  static saveConfig = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        paperConfigs,
        mspPercent,
        mrpPercent,
        royaltyFromMrpPercent,
        offlineExpensesPercent,
        onlineExpensesPercent,
        ebookRoyaltyPercent,
        ebookOnlineExpensesPercent,
        magazineRoyaltyOverride,
      } = req.body;

      if (!paperConfigs || !Array.isArray(paperConfigs) || paperConfigs.length === 0) {
        throw new ApiError(400, 'At least one paper configuration is required');
      }

      const numericFields = {
        mspPercent,
        mrpPercent,
        royaltyFromMrpPercent,
        offlineExpensesPercent,
        onlineExpensesPercent,
        ebookRoyaltyPercent,
        ebookOnlineExpensesPercent,
      };
      for (const [field, value] of Object.entries(numericFields)) {
        if (value === undefined || value === null || isNaN(Number(value))) {
          throw new ApiError(400, `${field} is required and must be a number`);
        }
      }

      const adminId = req.user?.userId || 'unknown';

      const payload = {
        paperConfigs: paperConfigs.map((p: any) => ({
          paperName: String(p.paperName).trim(),
          paperSize: String(p.paperSize).trim(),
          pricePerPage: Number(p.pricePerPage),
        })),
        mspPercent: Number(mspPercent),
        mrpPercent: Number(mrpPercent),
        royaltyFromMrpPercent: Number(royaltyFromMrpPercent),
        offlineExpensesPercent: Number(offlineExpensesPercent),
        onlineExpensesPercent: Number(onlineExpensesPercent),
        ebookRoyaltyPercent: Number(ebookRoyaltyPercent),
        ebookOnlineExpensesPercent: Number(ebookOnlineExpensesPercent),
        magazineRoyaltyOverride: magazineRoyaltyOverride !== undefined && magazineRoyaltyOverride !== ''
          ? Number(magazineRoyaltyOverride)
          : null,
        updatedBy: adminId,
      };

      const existing = await CalculatorConfig.findOne();
      let config;
      if (existing) {
        config = await CalculatorConfig.findByIdAndUpdate(existing._id, payload, { new: true });
      } else {
        config = await CalculatorConfig.create(payload);
      }

      res.status(200).json({
        success: true,
        message: 'Calculator configuration saved successfully',
        data: { config },
      });
    }
  );
}
