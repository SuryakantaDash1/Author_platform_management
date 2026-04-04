import Joi from 'joi';

export const bookValidation = {
  createBook: Joi.object({
    bookName: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Book name must be at least 2 characters',
      'string.max': 'Book name cannot exceed 200 characters',
      'any.required': 'Book name is required',
    }),
    subtitle: Joi.string().max(300).optional().allow(''),
    language: Joi.string().max(50).optional(),
    bookType: Joi.string().min(1).max(100).required().messages({
        'any.required': 'Book type is required',
      }),
    targetAudience: Joi.string().max(200).optional().allow(''),
    needFormatting: Joi.boolean().optional(),
    needCopyright: Joi.boolean().optional(),
    needDesigning: Joi.boolean().optional(),
    physicalCopies: Joi.number().integer().min(2).optional().messages({
      'number.min': 'Minimum 2 physical copies required',
      'number.integer': 'Physical copies must be a whole number',
    }),
    royaltyPercentage: Joi.number().min(0).max(100).optional(),
    expectedLaunchDate: Joi.date().min('now').required().messages({
      'date.min': 'Expected launch date must be in the future',
      'any.required': 'Expected launch date is required',
    }),
    marketplaces: Joi.array().items(Joi.string()).optional(),
    paymentPlan: Joi.string()
      .valid('full', '2_installments', '3_installments', '4_installments', 'pay_later')
      .optional(),
    hasCover: Joi.boolean().optional(),
  }),

  updateBook: Joi.object({
    bookName: Joi.string().min(2).max(200).optional(),
    subtitle: Joi.string().max(300).optional().allow(''),
    language: Joi.string().max(50).optional(),
    bookType: Joi.string().min(1).max(100).optional(),
    targetAudience: Joi.string().max(200).optional().allow(''),
    needFormatting: Joi.boolean().optional(),
    needCopyright: Joi.boolean().optional(),
    needDesigning: Joi.boolean().optional(),
    physicalCopies: Joi.number().integer().min(2).optional(),
    expectedLaunchDate: Joi.date().optional(),
    marketplaces: Joi.array().items(Joi.string()).optional(),
  }),
};
