import Joi from 'joi';

export const authorValidation = {
  updateProfile: Joi.object({
    publishedArticles: Joi.array().items(Joi.object({
      bookName: Joi.string().max(200).required(),
      isbn: Joi.string().max(50).optional().allow(''),
      bookPhoto: Joi.string().optional().allow(''),
      links: Joi.array().items(Joi.object({
        platform: Joi.string().max(100).required(),
        url: Joi.string().max(500).required(),
      })).optional(),
    })).optional(),
    address: Joi.object({
      pinCode: Joi.string().pattern(/^[0-9]{6}$/).optional().messages({
        'string.pattern.base': 'Pin code must be 6 digits',
      }),
      city: Joi.string().max(50).optional().messages({
        'string.max': 'City name cannot exceed 50 characters',
      }),
      district: Joi.string().max(50).optional().messages({
        'string.max': 'District name cannot exceed 50 characters',
      }),
      state: Joi.string().max(50).optional().messages({
        'string.max': 'State name cannot exceed 50 characters',
      }),
      country: Joi.string().max(50).optional().messages({
        'string.max': 'Country name cannot exceed 50 characters',
      }),
      housePlot: Joi.string().max(200).optional().allow('').messages({
        'string.max': 'House/Plot cannot exceed 200 characters',
      }),
      landmark: Joi.string().max(100).optional().allow('').messages({
        'string.max': 'Landmark cannot exceed 100 characters',
      }),
    }).optional(),
  }),

  addBankAccount: Joi.object({
    bankName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Bank name must be at least 2 characters',
      'string.max': 'Bank name cannot exceed 100 characters',
      'any.required': 'Bank name is required',
    }),
    accountHolderName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Account holder name must be at least 2 characters',
      'string.max': 'Account holder name cannot exceed 100 characters',
      'any.required': 'Account holder name is required',
    }),
    accountNumber: Joi.string()
      .min(9)
      .max(18)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.min': 'Account number must be at least 9 digits',
        'string.max': 'Account number cannot exceed 18 digits',
        'string.pattern.base': 'Account number must contain only numbers',
        'any.required': 'Account number is required',
      }),
    ifscCode: Joi.string()
      .length(11)
      .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .uppercase()
      .required()
      .messages({
        'string.length': 'IFSC code must be 11 characters',
        'string.pattern.base': 'Invalid IFSC code format',
        'any.required': 'IFSC code is required',
      }),
    branchName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Branch name must be at least 2 characters',
      'string.max': 'Branch name cannot exceed 100 characters',
      'any.required': 'Branch name is required',
    }),
    accountType: Joi.string().valid('primary', 'secondary').optional().messages({
      'any.only': 'Account type must be either primary or secondary',
    }),
  }),
};
