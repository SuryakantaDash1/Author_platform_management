import Joi from 'joi';

export const bookValidation = {
  createBook: Joi.object({
    bookName: Joi.string().min(2).max(200).required().messages({
      'string.min': 'Book name must be at least 2 characters',
      'string.max': 'Book name cannot exceed 200 characters',
      'any.required': 'Book name is required',
    }),
    subtitle: Joi.string().max(300).optional().messages({
      'string.max': 'Subtitle cannot exceed 300 characters',
    }),
    bookType: Joi.string()
      .valid('fiction', 'non-fiction', 'poetry', 'children', 'academic', 'other')
      .required()
      .messages({
        'any.only':
          'Book type must be one of: fiction, non-fiction, poetry, children, academic, other',
        'any.required': 'Book type is required',
      }),
    targetAudience: Joi.string().max(200).optional().messages({
      'string.max': 'Target audience cannot exceed 200 characters',
    }),
    needFormatting: Joi.boolean().optional(),
    needCopyright: Joi.boolean().optional(),
    physicalCopies: Joi.number().integer().min(2).optional().messages({
      'number.min': 'Minimum 2 physical copies required',
      'number.integer': 'Physical copies must be a whole number',
    }),
    royaltyPercentage: Joi.number().min(0).max(100).required().messages({
      'number.min': 'Royalty percentage cannot be negative',
      'number.max': 'Royalty percentage cannot exceed 100',
      'any.required': 'Royalty percentage is required',
    }),
    expectedLaunchDate: Joi.date().min('now').required().messages({
      'date.min': 'Expected launch date must be in the future',
      'any.required': 'Expected launch date is required',
    }),
    marketplaces: Joi.array().items(Joi.string()).optional().messages({
      'array.base': 'Marketplaces must be an array of strings',
    }),
  }),

  updateBook: Joi.object({
    bookName: Joi.string().min(2).max(200).optional().messages({
      'string.min': 'Book name must be at least 2 characters',
      'string.max': 'Book name cannot exceed 200 characters',
    }),
    subtitle: Joi.string().max(300).optional().messages({
      'string.max': 'Subtitle cannot exceed 300 characters',
    }),
    bookType: Joi.string()
      .valid('fiction', 'non-fiction', 'poetry', 'children', 'academic', 'other')
      .optional()
      .messages({
        'any.only':
          'Book type must be one of: fiction, non-fiction, poetry, children, academic, other',
      }),
    targetAudience: Joi.string().max(200).optional().messages({
      'string.max': 'Target audience cannot exceed 200 characters',
    }),
    needFormatting: Joi.boolean().optional(),
    needCopyright: Joi.boolean().optional(),
    physicalCopies: Joi.number().integer().min(2).optional().messages({
      'number.min': 'Minimum 2 physical copies required',
      'number.integer': 'Physical copies must be a whole number',
    }),
    expectedLaunchDate: Joi.date().optional().messages({
      'date.base': 'Invalid date format',
    }),
    marketplaces: Joi.array().items(Joi.string()).optional().messages({
      'array.base': 'Marketplaces must be an array of strings',
    }),
  }),
};
