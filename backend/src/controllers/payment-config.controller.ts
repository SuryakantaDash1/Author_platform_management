import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import PricingConfig from '../models/PricingConfig.model';
import PlatformConfig from '../models/PlatformConfig.model';

export class PaymentConfigController {
  // Get all configs (admin)
  static getAllConfigs = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const configs = await PricingConfig.find().sort({ language: 1 });
      const bookTypes = await PlatformConfig.findOne({ key: 'bookTypes' });
      res.status(200).json({
        success: true,
        data: { configs, bookTypes: bookTypes?.values || [] },
      });
    }
  );

  // Get single config by ID (admin)
  static getConfigById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const config = await PricingConfig.findById(req.params.id);
      if (!config) throw new ApiError(404, 'Configuration not found');
      res.status(200).json({ success: true, data: { config } });
    }
  );

  // Transform frontend payload to match DB schema
  static transformPayload(body: any) {
    const s = body.services || {};
    const toPrice = (obj: any) => ({
      main: parseFloat(obj?.price ?? obj?.main ?? 0),
      discount: parseFloat(obj?.discount ?? 0),
    });

    // Map installment option strings to label+splits objects
    const installmentMap: Record<string, { label: string; splits: number[] }> = {
      full: { label: 'Full Payment', splits: [100] },
      two: { label: '2 Installments', splits: [50, 50] },
      three: { label: '3 Installments', splits: [25, 50, 25] },
      four: { label: '4 Installments', splits: [25, 50, 25, 0] },
    };

    const rawInstallments = body.installmentOptions || [];
    const installmentOptions = rawInstallments.map((opt: any) => {
      if (typeof opt === 'string') return installmentMap[opt] || { label: opt, splits: [100] };
      return opt; // already an object
    });

    const ref = body.referral || body.referralConfig || {};

    return {
      language: body.language,
      publishingPrice: toPrice(s.publishing || body.publishingPrice),
      coverDesignPrice: toPrice(s.coverDesign || body.coverDesignPrice),
      distributionPrice: toPrice(s.distribution || body.distributionPrice),
      copyrightPrice: toPrice(s.copyright || body.copyrightPrice),
      formattingPrice: toPrice(s.formatting || body.formattingPrice),
      perBookCopyPrice: toPrice(s.perBookCopy || body.perBookCopyPrice),
      installmentOptions,
      referralConfig: {
        firstBookBonus: parseFloat(ref.firstBookBonus ?? 0),
        perReferralBonus: parseFloat(ref.perReferralBonus ?? 0),
      },
      platforms: body.platforms || [],
      benefits: body.benefits || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
    };
  }

  // Create new language config (admin)
  static createConfig = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { language } = req.body;
      if (!language) throw new ApiError(400, 'Language is required');

      const existing = await PricingConfig.findOne({ language: { $regex: new RegExp(`^${language}$`, 'i') } });
      if (existing) throw new ApiError(400, `Configuration for "${language}" already exists`);

      const transformed = PaymentConfigController.transformPayload(req.body);
      const config = await PricingConfig.create({
        ...transformed,
        createdBy: req.user?.userId || 'system',
      });

      res.status(201).json({
        success: true,
        message: `Pricing configuration for "${language}" created successfully`,
        data: { config },
      });
    }
  );

  // Update config (admin)
  static updateConfig = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const config = await PricingConfig.findById(req.params.id);
      if (!config) throw new ApiError(404, 'Configuration not found');

      if (req.body.language && req.body.language !== config.language) {
        const existing = await PricingConfig.findOne({
          language: { $regex: new RegExp(`^${req.body.language}$`, 'i') },
          _id: { $ne: config._id },
        });
        if (existing) throw new ApiError(400, `Configuration for "${req.body.language}" already exists`);
      }

      const transformed = PaymentConfigController.transformPayload(req.body);
      Object.assign(config, transformed);
      await config.save();

      res.status(200).json({
        success: true,
        message: 'Configuration updated successfully',
        data: { config },
      });
    }
  );

  // Delete config (admin)
  static deleteConfig = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const config = await PricingConfig.findById(req.params.id);
      if (!config) throw new ApiError(404, 'Configuration not found');

      await PricingConfig.deleteOne({ _id: config._id });

      res.status(200).json({
        success: true,
        message: `Configuration for "${config.language}" deleted successfully`,
      });
    }
  );

  // Get active configs (public - for author book form)
  static getPublicConfig = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const configs = await PricingConfig.find({ isActive: true })
        .select('-createdBy -__v')
        .sort({ language: 1 });

      const bookTypes = await PlatformConfig.findOne({ key: 'bookTypes' });

      res.status(200).json({
        success: true,
        data: {
          configs,
          languages: configs.map(c => c.language),
          bookTypes: bookTypes?.values || [],
        },
      });
    }
  );

  // ---- Book Types Management (admin) ----

  // Get book types
  static getBookTypes = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const doc = await PlatformConfig.findOne({ key: 'bookTypes' });
      res.status(200).json({
        success: true,
        data: { bookTypes: doc?.values || [] },
      });
    }
  );

  // Update book types (replace entire list)
  static updateBookTypes = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { bookTypes } = req.body;
      if (!Array.isArray(bookTypes)) throw new ApiError(400, 'bookTypes must be an array');

      const doc = await PlatformConfig.findOneAndUpdate(
        { key: 'bookTypes' },
        { values: bookTypes, updatedBy: req.user?.userId || 'system' },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Book types updated successfully',
        data: { bookTypes: doc.values },
      });
    }
  );
}
