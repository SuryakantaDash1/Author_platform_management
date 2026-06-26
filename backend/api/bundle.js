"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/models/OTP.model.ts
var OTP_model_exports = {};
__export(OTP_model_exports, {
  default: () => OTP_model_default
});
var import_mongoose5, OTPSchema, OTP_model_default;
var init_OTP_model = __esm({
  "src/models/OTP.model.ts"() {
    "use strict";
    import_mongoose5 = __toESM(require("mongoose"));
    OTPSchema = new import_mongoose5.Schema(
      {
        email: {
          type: String,
          required: true,
          lowercase: true,
          index: true
        },
        otp: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ["signup", "login", "reset"],
          required: true
        },
        attempts: {
          type: Number,
          default: 0,
          max: 3
        },
        expiresAt: {
          type: Date,
          required: true,
          index: { expires: 0 }
          // TTL index - auto-delete after expiry
        }
      },
      {
        timestamps: { createdAt: true, updatedAt: false }
      }
    );
    OTPSchema.index({ email: 1, type: 1 });
    OTP_model_default = import_mongoose5.default.model("OTP", OTPSchema);
  }
});

// api/index.ts
var api_exports = {};
__export(api_exports, {
  config: () => config,
  default: () => api_default
});
module.exports = __toCommonJS(api_exports);

// src/app.ts
var import_express17 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_morgan = __toESM(require("morgan"));
var import_cookie_parser = __toESM(require("cookie-parser"));

// src/utils/ApiError.ts
var ApiError = class extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var ApiError_default = ApiError;

// src/middlewares/error.middleware.ts
var errorHandler = (err, req, res, _next) => {
  console.error(`\u274C Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  if (err instanceof ApiError_default) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...process.env.NODE_ENV === "development" && { stack: err.stack }
    });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.message
    });
  }
  if (err.name === "MongoServerError" && err.code === 11e3) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired"
    });
  }
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  });
};
var notFound = (req, _res, next) => {
  const error = new ApiError_default(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

// src/config/cloudinary.ts
var import_cloudinary = require("cloudinary");

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
import_dotenv.default.config({ path: import_path.default.join(__dirname, "../../.env") });
var env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  API_VERSION: process.env.API_VERSION || "v1",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/povital_author_platform",
  MONGODB_URI_PROD: process.env.MONGODB_URI_PROD || "",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_jwt_secret_for_dev_only_min_32_chars",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "24h",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_min_32_chars",
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  ADMIN_CLIENT_URL: process.env.ADMIN_CLIENT_URL || "http://localhost:3000/admin",
  AUTHOR_CLIENT_URL: process.env.AUTHOR_CLIENT_URL || "http://localhost:3000/author",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587", 10),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "POVITAL <noreply@povital.com>",
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",
  OTP_EXPIRE_MINUTES: parseInt(process.env.OTP_EXPIRE_MINUTES || "10", 10),
  OTP_LENGTH: parseInt(process.env.OTP_LENGTH || "6", 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || "20971520", 10),
  // 20MB
  MAX_FILES_PER_UPLOAD: parseInt(process.env.MAX_FILES_PER_UPLOAD || "10", 10),
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE || "20", 10),
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE || "100", 10),
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "fallback_32_char_key_for_dev_only",
  ENCRYPTION_ALGORITHM: process.env.ENCRYPTION_ALGORITHM || "aes-256-cbc",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || "./logs",
  REFERRAL_EARNING_AMOUNT: parseInt(process.env.REFERRAL_EARNING_AMOUNT || "500", 10),
  REFERRAL_CODE_LENGTH: parseInt(process.env.REFERRAL_CODE_LENGTH || "8", 10),
  AUTHOR_ID_PREFIX: process.env.AUTHOR_ID_PREFIX || "AUT",
  BOOK_ID_PREFIX: process.env.BOOK_ID_PREFIX || "BK",
  TICKET_ID_PREFIX: process.env.TICKET_ID_PREFIX || "TKT",
  TRANSACTION_ID_PREFIX: process.env.TRANSACTION_ID_PREFIX || "TXN",
  PINCODE_API_URL: process.env.PINCODE_API_URL || "https://api.postalpincode.in/pincode"
};
if (env.NODE_ENV === "production") {
  const requiredEnvVars = [
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "MONGODB_URI_PROD",
    "CLOUDINARY_CLOUD_NAME",
    "EMAIL_USER",
    "EMAIL_PASSWORD"
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`\u274C Missing required environment variable: ${envVar}`);
    }
  }
}
var env_default = env;

// src/utils/logger.ts
var import_winston = __toESM(require("winston"));
var import_path2 = __toESM(require("path"));
var logFormat = import_winston.default.format.combine(
  import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  import_winston.default.format.errors({ stack: true }),
  import_winston.default.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
  })
);
var isServerless = !!process.env.VERCEL;
var transports = [
  // Console transport with colors
  new import_winston.default.transports.Console({
    format: import_winston.default.format.combine(
      import_winston.default.format.colorize(),
      logFormat
    )
  })
];
if (!isServerless) {
  transports.push(
    // File transport for errors
    new import_winston.default.transports.File({
      filename: import_path2.default.join(env_default.LOG_FILE_PATH, "error.log"),
      level: "error",
      maxsize: 5242880,
      // 5MB
      maxFiles: 5
    }),
    // File transport for combined logs
    new import_winston.default.transports.File({
      filename: import_path2.default.join(env_default.LOG_FILE_PATH, "combined.log"),
      maxsize: 5242880,
      // 5MB
      maxFiles: 5
    })
  );
}
var logger = import_winston.default.createLogger({
  level: env_default.LOG_LEVEL,
  format: logFormat,
  transports,
  exceptionHandlers: isServerless ? [] : [
    new import_winston.default.transports.File({
      filename: import_path2.default.join(env_default.LOG_FILE_PATH, "exceptions.log")
    })
  ],
  rejectionHandlers: isServerless ? [] : [
    new import_winston.default.transports.File({
      filename: import_path2.default.join(env_default.LOG_FILE_PATH, "rejections.log")
    })
  ]
});
if (env_default.NODE_ENV !== "production") {
  logger.add(
    new import_winston.default.transports.Console({
      format: import_winston.default.format.combine(
        import_winston.default.format.colorize(),
        import_winston.default.format.simple()
      )
    })
  );
}
var logger_default = logger;

// src/config/cloudinary.ts
import_cloudinary.v2.config({
  cloud_name: env_default.CLOUDINARY_CLOUD_NAME,
  api_key: env_default.CLOUDINARY_API_KEY,
  api_secret: env_default.CLOUDINARY_API_SECRET,
  secure: true
});
logger_default.info("\u2601\uFE0F Cloudinary configured successfully");

// src/config/db.ts
var import_mongoose = __toESM(require("mongoose"));
var globalForMongoose = global;
var cached = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cached;
var connectDB = async () => {
  if (import_mongoose.default.connection.readyState === 1) return import_mongoose.default;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }
    cached.promise = import_mongoose.default.connect(uri, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};
var db_default = connectDB;

// src/services/cron.service.ts
var import_node_cron = __toESM(require("node-cron"));

// src/models/Book.model.ts
var import_mongoose2 = __toESM(require("mongoose"));
var priceBreakdownItem = {
  original: { type: Number, default: 0 },
  discounted: { type: Number, default: 0 }
};
var BookSchema = new import_mongoose2.Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    authorId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    bookName: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    language: {
      type: String,
      trim: true,
      default: "English"
    },
    bookType: {
      type: String,
      required: true,
      trim: true
    },
    targetAudience: {
      type: String,
      trim: true
    },
    coverPage: {
      type: String
    },
    needFormatting: {
      type: Boolean,
      default: false
    },
    needCopyright: {
      type: Boolean,
      default: false
    },
    needDesigning: {
      type: Boolean,
      default: false
    },
    physicalCopies: {
      type: Number,
      default: 2,
      min: 2
    },
    royaltyPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    expectedLaunchDate: {
      type: Date,
      required: true
    },
    actualLaunchDate: {
      type: Date
    },
    uploadedFiles: [{
      type: String
    }],
    marketplaces: [{
      type: String
    }],
    status: {
      type: String,
      enum: ["draft", "pending", "payment_pending", "in_progress", "formatting", "designing", "printing", "published", "rejected"],
      default: "draft"
    },
    rejectionReason: {
      type: String
    },
    totalSellingUnits: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    priceBreakdown: {
      publishing: priceBreakdownItem,
      coverDesign: priceBreakdownItem,
      formatting: priceBreakdownItem,
      copyright: priceBreakdownItem,
      distribution: priceBreakdownItem,
      physicalCopies: {
        original: { type: Number, default: 0 },
        discounted: { type: Number, default: 0 },
        quantity: { type: Number, default: 2 }
      },
      netAmount: { type: Number, default: 0 },
      totalDiscount: { type: Number, default: 0 },
      referralDiscount: { type: Number, default: 0 },
      finalAmount: { type: Number, default: 0 }
    },
    paymentPlan: {
      type: String,
      enum: ["full", "2_installments", "3_installments", "4_installments", "pay_later"],
      default: "full"
    },
    paymentStatus: {
      totalAmount: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      pendingAmount: { type: Number, default: 0 },
      paymentCompletionPercentage: { type: Number, default: 0 },
      dueDate: { type: Date },
      installments: [{
        amount: { type: Number, required: true },
        status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
        paidAt: { type: Date }
      }]
    },
    platformWiseSales: {
      type: Map,
      of: new import_mongoose2.Schema({
        sellingUnits: { type: Number, default: 0 },
        productLink: { type: String },
        rating: { type: Number, min: 0, max: 5 }
      }, { _id: false }),
      default: /* @__PURE__ */ new Map()
    },
    statusHistory: [{
      status: { type: String, required: true },
      changedBy: { type: String, required: true },
      changedAt: { type: Date, default: Date.now },
      note: { type: String }
    }],
    paymentRequests: [{
      amount: { type: Number, required: true },
      serviceType: { type: String, required: true },
      description: { type: String, required: true },
      status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
      createdAt: { type: Date, default: Date.now }
    }],
    createdBy: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        if (ret.platformWiseSales instanceof Map) {
          const obj = {};
          ret.platformWiseSales.forEach((v, k) => {
            obj[k] = v;
          });
          ret.platformWiseSales = obj;
        }
        return ret;
      }
    }
  }
);
BookSchema.index({ bookName: "text" });
BookSchema.index({ status: 1, createdAt: -1 });
BookSchema.index({ authorId: 1, status: 1 });
var Book_model_default = import_mongoose2.default.model("Book", BookSchema);

// src/models/Author.model.ts
var import_mongoose3 = __toESM(require("mongoose"));
var AuthorSchema = new import_mongoose3.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      ref: "User",
      index: true
    },
    authorId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    profilePicture: {
      type: String
    },
    publishedArticles: [{
      bookName: { type: String, required: true, trim: true },
      isbn: { type: String, trim: true },
      bookPhoto: { type: String },
      links: [{
        platform: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true }
      }]
    }],
    address: {
      pinCode: String,
      city: String,
      district: String,
      state: String,
      country: String,
      housePlot: String,
      landmark: String
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    referredBy: {
      type: String,
      ref: "Author",
      index: true
    },
    totalBooks: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    totalSoldUnits: {
      type: Number,
      default: 0
    },
    isRestricted: {
      type: Boolean,
      default: false
    },
    restrictionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
AuthorSchema.index({ "address.state": 1, "address.district": 1 });
var Author_model_default = import_mongoose3.default.model("Author", AuthorSchema);

// src/models/User.model.ts
var import_mongoose4 = __toESM(require("mongoose"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var UserSchema = new import_mongoose4.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true
    },
    mobile: {
      type: String,
      trim: true,
      sparse: true,
      index: true
    },
    password: {
      type: String,
      select: false
      // Don't include in queries by default
    },
    role: {
      type: String,
      enum: ["super_admin", "sub_admin", "author"],
      default: "author",
      required: true
    },
    tier: {
      type: String,
      enum: ["free", "basic", "pro", "enterprise"],
      default: "free",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isRestricted: {
      type: Boolean,
      default: false
    },
    permissions: [{
      type: String
    }],
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String
    },
    backupCodes: [{
      type: String
    }],
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await import_bcryptjs.default.genSalt(10);
    this.password = await import_bcryptjs.default.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return import_bcryptjs.default.compare(candidatePassword, this.password);
};
UserSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};
UserSchema.virtual("authorProfile", {
  ref: "Author",
  localField: "userId",
  foreignField: "userId",
  justOne: true
});
var User_model_default = import_mongoose4.default.model("User", UserSchema);

// src/services/email.service.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_fs = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));
var EmailService = class {
  static {
    this.transporter = import_nodemailer.default.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  // Load email template
  static loadTemplate(templateName) {
    const templatePath = import_path3.default.join(__dirname, `../templates/email/${templateName}.html`);
    return import_fs.default.readFileSync(templatePath, "utf-8");
  }
  // Replace template variables
  static replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, value);
    }
    return result;
  }
  // Send OTP email
  static async sendOTPEmail(email, otp, type) {
    try {
      const subject = type === "signup" ? "Your OTP for Registration - POVITAL" : type === "reset" ? "Your OTP for Password Reset - POVITAL" : "Your OTP for Login - POVITAL";
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Your OTP Code</h2>
            <p>Your OTP for ${type === "signup" ? "registration" : type === "reset" ? "password reset" : "login"} is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL. All rights reserved.</p>
          </div>
        `
      });
      console.log(`\u2705 OTP email sent to ${email}`);
    } catch (error) {
      console.error("\u274C Error sending OTP email:", error);
      throw new Error("Failed to send OTP email");
    }
  }
  // Send welcome email
  static async sendWelcomeEmail(email, name, password) {
    try {
      const credentialsBlock = password ? `
        <div style="background: #f0f4ff; border-left: 4px solid #4F46E5; padding: 16px 20px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">Your Login Credentials</p>
          <p style="margin: 4px 0; color: #555;">Email: <strong>${email}</strong></p>
          <p style="margin: 4px 0; color: #555;">Password: <strong style="font-family: monospace; font-size: 15px; color: #4F46E5;">${password}</strong></p>
        </div>
      ` : "";
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to POVITAL - Your Author Account is Ready!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to POVITAL, ${name}!</h2>
            <p>Your author account has been successfully created. You can now start publishing your books and managing your content.</p>
            ${credentialsBlock}
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/author/login" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Login to Dashboard
              </a>
            </div>
            <p style="color: #666;">Thank you for choosing POVITAL!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL. All rights reserved.</p>
          </div>
        `
      });
      console.log(`\u2705 Welcome email sent to ${email}`);
    } catch (error) {
      console.error("\u274C Error sending welcome email:", error);
    }
  }
  // Send admin password reset email
  static async sendAdminPasswordResetEmail(email, name, resetLink) {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your POVITAL Admin Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your admin password. Click the button below to reset it:</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666;">This link will expire in 1 hour.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">Or copy and paste this URL into your browser:<br>
            <a href="${resetLink}" style="color: #4F46E5;">${resetLink}</a></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL. All rights reserved.</p>
          </div>
        `
      });
      console.log(`\u2705 Admin password reset email sent to ${email}`);
    } catch (error) {
      console.error("\u274C Error sending admin password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
  // Send admin-created author credentials
  static async sendAdminCreatedAuthorEmail(email, name, authorId, password, referralCode) {
    try {
      const template = this.loadTemplate("admin-created-author");
      const variables = {
        authorName: name,
        authorId,
        password,
        referralCode: referralCode || "N/A",
        email,
        loginUrl: `${process.env.FRONTEND_URL}/author/login`,
        year: (/* @__PURE__ */ new Date()).getFullYear().toString()
      };
      const html = this.replaceVariables(template, variables);
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your POVITAL Author Account Credentials",
        html
      });
      console.log(`Admin-created author email sent to ${email}`);
    } catch (error) {
      console.error("Error sending admin-created author email:", error);
      throw new Error("Failed to send credentials email");
    }
  }
  // Send payment request email
  static async sendPaymentRequestEmail(email, name, bookName, amount, paymentLink) {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: `Payment Request for "${bookName}" - POVITAL`,
        html: `
          <p>Dear ${name},</p>
          <p>Your book "${bookName}" has been processed. Please complete the payment of \u20B9${amount}.</p>
          <p><a href="${paymentLink}">Click here to pay</a></p>
          <p>Thank you,<br>POVITAL Team</p>
        `
      });
      console.log(`Payment request email sent to ${email}`);
    } catch (error) {
      console.error("Error sending payment request email:", error);
    }
  }
  // Send royalty payment confirmation
  static async sendRoyaltyPaymentEmail(email, name, amount, transactionId) {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: `Royalty Payment Processed - POVITAL`,
        html: `
          <p>Dear ${name},</p>
          <p>Your royalty payment of \u20B9${amount} has been processed successfully.</p>
          <p>Transaction ID: ${transactionId}</p>
          <p>Thank you,<br>POVITAL Team</p>
        `
      });
      console.log(`Royalty payment email sent to ${email}`);
    } catch (error) {
      console.error("Error sending royalty payment email:", error);
    }
  }
  // Send book approval email
  static async sendBookApprovalEmail(email, name, bookName, bookId) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Book Approved!</h2>
        <p>Dear ${name},</p>
        <p>Great news! Your book <strong>"${bookName}"</strong> (ID: ${bookId}) has been approved and is now moving to the formatting stage.</p>
        <p>We will keep you updated as your book progresses through the publishing pipeline.</p>
        <p>Thank you,<br>POVITAL Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL. All rights reserved.</p>
      </div>
    `;
    await this.sendRawEmail(email, `Your Book "${bookName}" Has Been Approved - POVITAL`, html);
  }
  // Send book decline email
  static async sendBookDeclineEmail(email, name, bookName, bookId, reason) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Book Submission Update</h2>
        <p>Dear ${name},</p>
        <p>Unfortunately, your book <strong>"${bookName}"</strong> (ID: ${bookId}) has been declined.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You may update your submission and resubmit for review.</p>
        <p>Thank you,<br>POVITAL Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL. All rights reserved.</p>
      </div>
    `;
    await this.sendRawEmail(email, `Update on Your Book "${bookName}" - POVITAL`, html);
  }
  // Send book status update email
  static async sendBookStatusUpdateEmail(email, name, bookName, bookId, newStatus) {
    const statusLabels = {
      formatting: "Formatting",
      designing: "Designing",
      printing: "Printing",
      published: "Published"
    };
    const label = statusLabels[newStatus] || newStatus;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Book Status Update</h2>
        <p>Dear ${name},</p>
        <p>Your book <strong>"${bookName}"</strong> (ID: ${bookId}) has moved to the <strong>${label}</strong> stage.</p>
        ${newStatus === "published" ? "<p>Congratulations! Your book is now live and available for readers.</p>" : "<p>We will notify you when the next stage is reached.</p>"}
        <p>Thank you,<br>POVITAL Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL. All rights reserved.</p>
      </div>
    `;
    await this.sendRawEmail(email, `Book "${bookName}" - Status Update: ${label} - POVITAL`, html);
  }
  // Send payment request notification
  static async sendPaymentRequestNotification(email, name, bookName, amount, description) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Request</h2>
        <p>Dear ${name},</p>
        <p>A new payment request has been created for your book <strong>"${bookName}"</strong>.</p>
        <p><strong>Amount:</strong> &#8377;${amount}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p>Please log in to your dashboard to complete the payment.</p>
        <p>Thank you,<br>POVITAL Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL. All rights reserved.</p>
      </div>
    `;
    await this.sendRawEmail(email, `Payment Request for "${bookName}" - POVITAL`, html);
  }
  // Send book payment confirmation email
  static async sendBookPaymentConfirmationEmail(email, name, bookName, bookId, paidAmount, totalAmount, pendingAmount, paymentId, installmentNumber, totalInstallments) {
    const isFullyPaid = pendingAmount <= 0;
    const pct = Math.round((totalAmount - pendingAmount) / totalAmount * 100);
    const statusBlock = isFullyPaid ? `<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;border-radius:6px;margin:20px 0;">
           <p style="margin:0;font-weight:bold;color:#15803d;font-size:15px;">\u2705 Payment Complete \u2014 Full Amount Received</p>
           <p style="margin:6px 0 0;color:#166534;font-size:13px;">Your book is now under review. We'll notify you on every stage update.</p>
         </div>` : `<div style="background:#fff7ed;border-left:4px solid #f97316;padding:16px 20px;border-radius:6px;margin:20px 0;">
           <p style="margin:0;font-weight:bold;color:#c2410c;font-size:15px;">\u23F3 Partial Payment Received</p>
           <p style="margin:6px 0 0;color:#9a3412;font-size:13px;">Remaining amount of <strong>\u20B9${pendingAmount.toLocaleString("en-IN")}</strong> is due. Please pay from your Books dashboard.</p>
         </div>`;
    const progressBar = `
      <div style="margin:20px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:13px;color:#555;">Payment Progress</span>
          <span style="font-size:13px;font-weight:bold;color:#4F46E5;">${pct}%</span>
        </div>
        <div style="background:#e5e7eb;border-radius:999px;height:10px;">
          <div style="background:${isFullyPaid ? "#22c55e" : "#4F46E5"};width:${pct}%;height:10px;border-radius:999px;"></div>
        </div>
      </div>`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:28px 32px;">
          <h1 style="margin:0;color:#fff;font-size:22px;">Payment ${isFullyPaid ? "Successful" : "Received"}</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">POVITAL Author Platform</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="color:#374151;font-size:15px;">Dear <strong>${name}</strong>,</p>
          <p style="color:#6b7280;font-size:14px;">We have received your payment for the book listed below.</p>

          ${statusBlock}

          <!-- Book Details -->
          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Book Name</td>
              <td style="padding:10px 14px;color:#111827;font-weight:bold;border:1px solid #e5e7eb;">${bookName}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Book ID</td>
              <td style="padding:10px 14px;color:#111827;border:1px solid #e5e7eb;">${bookId}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Installment</td>
              <td style="padding:10px 14px;color:#111827;border:1px solid #e5e7eb;">${installmentNumber} of ${totalInstallments}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Amount Paid Now</td>
              <td style="padding:10px 14px;color:#22c55e;font-weight:bold;font-size:16px;border:1px solid #e5e7eb;">\u20B9${paidAmount.toLocaleString("en-IN")}</td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Total Amount</td>
              <td style="padding:10px 14px;color:#111827;border:1px solid #e5e7eb;">\u20B9${totalAmount.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Remaining Due</td>
              <td style="padding:10px 14px;color:${isFullyPaid ? "#22c55e" : "#f97316"};font-weight:bold;border:1px solid #e5e7eb;">
                ${isFullyPaid ? "\u20B90 \u2014 Fully Paid" : "\u20B9" + pendingAmount.toLocaleString("en-IN")}
              </td>
            </tr>
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Transaction ID</td>
              <td style="padding:10px 14px;color:#111827;font-family:monospace;font-size:13px;border:1px solid #e5e7eb;">${paymentId}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#6b7280;border:1px solid #e5e7eb;">Date</td>
              <td style="padding:10px 14px;color:#111827;border:1px solid #e5e7eb;">${(/* @__PURE__ */ new Date()).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</td>
            </tr>
          </table>

          ${progressBar}

          ${!isFullyPaid ? `
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.FRONTEND_URL}/author/books"
               style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:13px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;display:inline-block;">
              Pay Remaining Amount
            </a>
          </div>` : ""}

          <p style="color:#9ca3af;font-size:13px;margin-top:24px;">If you have any questions, reply to this email or contact us at <a href="mailto:support@povital.com" style="color:#4F46E5;">support@povital.com</a></p>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} POVITAL Author Platform. All rights reserved.</p>
        </div>
      </div>
    `;
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: isFullyPaid ? `\u2705 Payment Complete for "${bookName}" \u2014 POVITAL` : `\u{1F4B3} Payment Received for "${bookName}" (\u20B9${pendingAmount.toLocaleString("en-IN")} remaining) \u2014 POVITAL`,
        html
      });
      console.log(`\u2705 Payment confirmation email sent to ${email}`);
    } catch (error) {
      console.error("\u274C Error sending payment confirmation email:", error);
    }
  }
  // Send raw HTML email (used by cron reminders)
  static async sendRawEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: `"POVITAL" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
    }
  }
};

// src/services/cron.service.ts
var CronService = class _CronService {
  /**
   * Initialize all cron jobs
   */
  static init() {
    import_node_cron.default.schedule("30 3 * * *", async () => {
      console.log("\u23F0 [CRON] Running daily payment reminder check...");
      await _CronService.checkPayLaterReminders();
    });
    setTimeout(() => {
      console.log("\u23F0 [CRON] Initial payment reminder check on startup...");
      _CronService.checkPayLaterReminders().catch(
        (err) => console.error("\u23F0 [CRON] Startup check failed:", err)
      );
    }, 3e4);
    console.log("\u23F0 [CRON] Payment reminder cron job scheduled (daily at 9:00 AM IST)");
  }
  /**
   * Check all pay_later books and send reminders at:
   * - 3 days before due date
   * - 1 day before due date
   * - On due date
   * - After due date: mark as overdue
   */
  static async checkPayLaterReminders() {
    try {
      const books = await Book_model_default.find({
        paymentPlan: "pay_later",
        "paymentStatus.pendingAmount": { $gt: 0 },
        "paymentStatus.dueDate": { $exists: true, $ne: null }
      }).lean();
      if (books.length === 0) {
        console.log("\u23F0 [CRON] No pay_later books with pending payments found.");
        return;
      }
      console.log(`\u23F0 [CRON] Found ${books.length} pay_later book(s) to check.`);
      const now = /* @__PURE__ */ new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      for (const book of books) {
        try {
          const dueDate = new Date(book.paymentStatus.dueDate);
          const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
          const diffMs = dueDay.getTime() - startOfToday.getTime();
          const daysUntilDue = Math.round(diffMs / (1e3 * 60 * 60 * 24));
          const author = await Author_model_default.findOne({ authorId: book.authorId }).lean();
          if (!author) continue;
          const user = await User_model_default.findOne({ userId: author.userId }).lean();
          if (!user?.email) continue;
          const amount = book.paymentStatus.pendingAmount || book.paymentStatus.totalAmount || 0;
          const formattedAmount = `\u20B9${amount.toLocaleString("en-IN")}`;
          const formattedDueDate = dueDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          });
          if (daysUntilDue === 3) {
            console.log(`\u23F0 [CRON] Sending 3-day reminder for book ${book.bookId} to ${user.email}`);
            await _CronService.sendPaymentReminder(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate,
              "3 days"
            );
          } else if (daysUntilDue === 1) {
            console.log(`\u23F0 [CRON] Sending 1-day reminder for book ${book.bookId} to ${user.email}`);
            await _CronService.sendPaymentReminder(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate,
              "1 day"
            );
          } else if (daysUntilDue === 0) {
            console.log(`\u23F0 [CRON] Sending due-today reminder for book ${book.bookId} to ${user.email}`);
            await _CronService.sendPaymentReminder(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate,
              "today"
            );
          } else if (daysUntilDue < 0) {
            console.log(`\u23F0 [CRON] Book ${book.bookId} is OVERDUE by ${Math.abs(daysUntilDue)} day(s). Setting to payment_pending.`);
            await Book_model_default.updateOne(
              { bookId: book.bookId },
              {
                $set: {
                  status: "payment_pending",
                  "paymentStatus.installments.$[elem].status": "overdue"
                }
              },
              { arrayFilters: [{ "elem.status": "pending" }] }
            );
            await _CronService.sendOverdueNotification(
              user.email,
              user.firstName,
              book.bookId,
              book.bookName,
              formattedAmount,
              formattedDueDate
            );
          }
        } catch (bookErr) {
          console.error(`\u23F0 [CRON] Error processing book ${book.bookId}:`, bookErr);
        }
      }
      console.log("\u23F0 [CRON] Payment reminder check completed.");
    } catch (err) {
      console.error("\u23F0 [CRON] Error in checkPayLaterReminders:", err);
    }
  }
  /**
   * Send payment reminder email
   */
  static async sendPaymentReminder(email, name, bookId, bookName, amount, dueDate, timeLeft) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const isUrgent = timeLeft === "today" || timeLeft === "1 day";
    const subject = timeLeft === "today" ? `Payment Due Today \u2014 "${bookName}" | POVITAL` : `Payment Reminder \u2014 "${bookName}" due in ${timeLeft} | POVITAL`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;margin-bottom:20px">
          <h2 style="color:#4F46E5;margin:0">POVITAL</h2>
        </div>

        <h3 style="color:#1F2937">Dear ${name},</h3>

        <p style="color:#4B5563;line-height:1.6">
          This is a ${isUrgent ? "<strong>urgent</strong>" : "friendly"} reminder that your payment for the book
          <strong>"${bookName}"</strong> (${bookId}) is due ${timeLeft === "today" ? "<strong>today</strong>" : `in <strong>${timeLeft}</strong>`}.
        </p>

        <div style="background:${isUrgent ? "#FEF2F2" : "#F0F9FF"};border:1px solid ${isUrgent ? "#FECACA" : "#BAE6FD"};border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="padding:8px 0;color:#6B7280;font-size:14px">Book ID</td>
              <td style="padding:8px 0;color:#1F2937;font-weight:600;text-align:right;font-size:14px">${bookId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6B7280;font-size:14px">Amount Due</td>
              <td style="padding:8px 0;color:${isUrgent ? "#DC2626" : "#1F2937"};font-weight:700;text-align:right;font-size:18px">${amount}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6B7280;font-size:14px">Due Date</td>
              <td style="padding:8px 0;color:#1F2937;font-weight:600;text-align:right;font-size:14px">${dueDate}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin:24px 0">
          <a href="${frontendUrl}/author/books"
             style="display:inline-block;background:#4F46E5;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Pay Now
          </a>
        </div>

        ${isUrgent ? `
        <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:12px 16px;margin:16px 0">
          <p style="color:#92400E;font-size:13px;margin:0">
            <strong>Important:</strong> If payment is not received by the due date, your book publishing will be paused until the payment is completed.
          </p>
        </div>
        ` : ""}

        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
          This is an automated reminder from POVITAL. If you have already made the payment, please ignore this email.
        </p>
      </div>
    `;
    await EmailService.sendRawEmail(email, subject, html);
  }
  /**
   * Send overdue notification
   */
  static async sendOverdueNotification(email, name, bookId, bookName, amount, dueDate) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="text-align:center;margin-bottom:20px">
          <h2 style="color:#4F46E5;margin:0">POVITAL</h2>
        </div>

        <h3 style="color:#DC2626">Payment Overdue \u2014 Action Required</h3>

        <p style="color:#4B5563;line-height:1.6">
          Dear ${name}, the payment for your book <strong>"${bookName}"</strong> (${bookId}) was due on
          <strong>${dueDate}</strong> and has not been received.
        </p>

        <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:20px;margin:20px 0">
          <p style="color:#991B1B;font-weight:600;margin:0 0 8px 0">Publishing Paused</p>
          <p style="color:#7F1D1D;font-size:14px;margin:0">
            Your book's publishing process has been paused. To resume, please complete the pending payment of <strong>${amount}</strong>.
          </p>
        </div>

        <div style="text-align:center;margin:24px 0">
          <a href="${frontendUrl}/author/books"
             style="display:inline-block;background:#DC2626;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Pay Now to Resume
          </a>
        </div>

        <p style="color:#6B7280;font-size:13px">
          If you need help or want to request an extension, please contact our support team.
        </p>
      </div>
    `;
    await EmailService.sendRawEmail(email, `Payment Overdue \u2014 "${bookName}" Publishing Paused | POVITAL`, html);
  }
};

// src/routes/auth.routes.ts
var import_express = require("express");

// src/services/auth.service.ts
var import_crypto = __toESM(require("crypto"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
init_OTP_model();

// src/models/Referral.model.ts
var import_mongoose6 = __toESM(require("mongoose"));
var ReferralSchema = new import_mongoose6.Schema(
  {
    referrerId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    referredAuthorId: {
      type: String,
      required: true,
      ref: "Author",
      unique: true,
      index: true
    },
    referralCode: {
      type: String,
      required: true,
      uppercase: true
    },
    earningPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    commissionAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending"
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    availableBalance: {
      type: Number,
      default: 0
    },
    utilizedBalance: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
ReferralSchema.index({ referrerId: 1, isActive: 1 });
var Referral_model_default = import_mongoose6.default.model("Referral", ReferralSchema);

// src/utils/helpers.ts
var generateUniqueId = (prefix, length = 6) => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
  const uniquePart = (timestamp + random).slice(-length);
  return `${prefix}${uniquePart}`;
};
var generateReferralCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < env_default.REFERRAL_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
var calculateRoyalty = (platformWiseSales, expenses, royaltyPercentage, adjustments = {}) => {
  let totalRevenue = 0;
  let productionCost = 0;
  for (const platform in platformWiseSales) {
    const { units, sellingPrice, costPerUnit } = platformWiseSales[platform];
    totalRevenue += units * sellingPrice;
    productionCost += units * costPerUnit;
  }
  const grossMargin = totalRevenue - productionCost;
  const totalExpenses = (expenses.adsCost || 0) + (expenses.platformFees || 0) + (expenses.returnsExchanges || 0);
  const netProfit = grossMargin - totalExpenses;
  const authorRoyalty = netProfit * (royaltyPercentage / 100);
  const referralDeduction = adjustments.referralDeduction || 0;
  const outstandingDeduction = adjustments.outstandingDeduction || 0;
  const finalRoyalty = Math.max(0, authorRoyalty - referralDeduction - outstandingDeduction);
  return {
    totalRevenue,
    productionCost,
    grossMargin,
    totalExpenses,
    netProfit,
    authorRoyalty,
    finalRoyalty
  };
};

// src/services/auth.service.ts
var AuthService = class {
  // Generate OTP
  static generateOTP() {
    return import_crypto.default.randomInt(1e5, 999999).toString();
  }
  // Store OTP in database
  static async storeOTP(email, type) {
    await OTP_model_default.deleteMany({ email, type });
    const otp = this.generateOTP();
    const hashedOTP = import_crypto.default.createHash("sha256").update(otp).digest("hex");
    await OTP_model_default.create({
      email,
      otp: hashedOTP,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1e3)
    });
    return otp;
  }
  // Verify OTP
  static async verifyOTP(email, otp, type) {
    const hashedOTP = import_crypto.default.createHash("sha256").update(otp).digest("hex");
    const otpRecord = await OTP_model_default.findOne({
      email,
      type,
      otp: hashedOTP,
      expiresAt: { $gt: /* @__PURE__ */ new Date() }
    });
    if (!otpRecord) {
      const existingOTP = await OTP_model_default.findOne({ email, type, expiresAt: { $gt: /* @__PURE__ */ new Date() } });
      if (existingOTP) {
        existingOTP.attempts += 1;
        await existingOTP.save();
        if (existingOTP.attempts >= 3) {
          await OTP_model_default.deleteOne({ _id: existingOTP._id });
          throw new Error("Maximum OTP attempts exceeded");
        }
      }
      return false;
    }
    await OTP_model_default.deleteOne({ _id: otpRecord._id });
    return true;
  }
  // Generate JWT tokens
  static generateTokens(user) {
    const payload = {
      userId: user.userId,
      role: user.role,
      tier: user.tier,
      permissions: user.permissions
    };
    const accessToken = import_jsonwebtoken.default.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h"
    });
    const refreshToken = import_jsonwebtoken.default.sign({ userId: user.userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d"
    });
    return { accessToken, refreshToken };
  }
  // Verify refresh token
  static verifyRefreshToken(token) {
    try {
      const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_REFRESH_SECRET);
      return decoded.userId;
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
  // Generate password reset token
  static generatePasswordResetToken() {
    return import_crypto.default.randomBytes(32).toString("hex");
  }
  // Store password reset token
  static async storePasswordResetToken(email) {
    const token = this.generatePasswordResetToken();
    const hashedToken = import_crypto.default.createHash("sha256").update(token).digest("hex");
    await OTP_model_default.deleteMany({ email, type: "reset" });
    await OTP_model_default.create({
      email,
      otp: hashedToken,
      type: "reset",
      expiresAt: new Date(Date.now() + 60 * 60 * 1e3)
      // 1 hour
    });
    return token;
  }
  // Verify password reset token
  static async verifyPasswordResetToken(token) {
    const hashedToken = import_crypto.default.createHash("sha256").update(token).digest("hex");
    const otpRecord = await OTP_model_default.findOne({
      otp: hashedToken,
      type: "reset",
      expiresAt: { $gt: /* @__PURE__ */ new Date() }
    });
    if (!otpRecord) {
      return null;
    }
    return otpRecord.email;
  }
  // Create new user and author
  static async createAuthor(data) {
    const userId = generateUniqueId("USR");
    const authorId = generateUniqueId("AUT");
    const newReferralCode = generateReferralCode();
    const user = await User_model_default.create({
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      // Will be hashed by pre-save hook
      role: "author",
      tier: "free",
      isActive: true
    });
    let referredBy;
    let referrerAuthorId;
    let usedReferralCode;
    if (data.referralCode) {
      const referrer = await Author_model_default.findOne({ referralCode: data.referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer.authorId;
        referrerAuthorId = referrer.authorId;
        usedReferralCode = data.referralCode.toUpperCase();
      }
    }
    const author = await Author_model_default.create({
      userId,
      authorId,
      referralCode: newReferralCode,
      referredBy
    });
    if (referrerAuthorId && usedReferralCode) {
      await Referral_model_default.create({
        referrerId: referrerAuthorId,
        referredAuthorId: authorId,
        referralCode: usedReferralCode,
        earningPercentage: 0,
        // Admin sets the actual percentage later
        totalEarnings: 0,
        availableBalance: 0,
        utilizedBalance: 0,
        isActive: true
      });
    }
    return { user, author };
  }
  // OAuth user creation/login
  static async handleOAuthUser(profile) {
    let user = await User_model_default.findOne({ email: profile.email });
    if (!user) {
      const userId = generateUniqueId("USR");
      const authorId = generateUniqueId("AUT");
      const referralCode = generateReferralCode();
      user = await User_model_default.create({
        userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        role: "author",
        tier: "free",
        isActive: true
      });
      await Author_model_default.create({
        userId,
        authorId,
        referralCode,
        profilePicture: profile.profilePicture
      });
    } else {
      user.lastLogin = /* @__PURE__ */ new Date();
      await user.save();
    }
    return user;
  }
};

// src/utils/asyncHandler.ts
var asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// src/controllers/auth.controller.ts
var AuthController = class {
  static {
    // Send OTP for email-based signup or login
    this.sendOTP = asyncHandler(
      async (req, res, _next) => {
        const { email, type } = req.body;
        if (!email || !type) {
          throw new ApiError_default(400, "Email and type are required");
        }
        const existingUser = await User_model_default.findOne({ email });
        if (type === "signup" && existingUser) {
          throw new ApiError_default(400, "Email already registered. Please login.");
        }
        if (type === "login" && !existingUser) {
          throw new ApiError_default(404, "Email not registered. Please sign up.");
        }
        const otp = await AuthService.storeOTP(email, type);
        await EmailService.sendOTPEmail(
          email,
          otp,
          type
        );
        res.status(200).json({
          success: true,
          message: `OTP sent successfully to ${email}`
        });
      }
    );
  }
  static {
    // Verify OTP and complete signup (DEPRECATED - Use /api/author/auth endpoints instead)
    this.verifyOTPSignup = asyncHandler(
      async (_req, _res, _next) => {
        throw new ApiError_default(
          410,
          "This endpoint is deprecated. Please use /api/author/auth/verify-otp-signup instead."
        );
      }
    );
  }
  static {
    // Verify OTP and login
    this.verifyOTPLogin = asyncHandler(
      async (req, res, _next) => {
        const { email, otp } = req.body;
        if (!email || !otp) {
          throw new ApiError_default(400, "Email and OTP are required");
        }
        const isValid = await AuthService.verifyOTP(email, otp, "login");
        if (!isValid) {
          throw new ApiError_default(400, "Invalid or expired OTP");
        }
        const user = await User_model_default.findOne({ email });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        if (!user.isActive) {
          throw new ApiError_default(403, "Account is deactivated. Please contact support.");
        }
        user.lastLogin = /* @__PURE__ */ new Date();
        await user.save();
        const tokens = AuthService.generateTokens(user);
        const author = await Author_model_default.findOne({ userId: user.userId });
        res.status(200).json({
          success: true,
          message: "Login successful",
          data: {
            user: {
              userId: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              tier: user.tier
            },
            author: author ? {
              authorId: author.authorId,
              referralCode: author.referralCode
            } : null,
            tokens
          }
        });
      }
    );
  }
  static {
    // Google OAuth callback
    this.googleOAuthCallback = asyncHandler(
      async (req, res, _next) => {
        const { code } = req.query;
        if (!code) {
          throw new ApiError_default(400, "Authorization code is required");
        }
        const profile = {
          email: "user@gmail.com",
          firstName: "John",
          lastName: "Doe",
          profilePicture: "https://..."
        };
        const user = await AuthService.handleOAuthUser(profile);
        user.lastLogin = /* @__PURE__ */ new Date();
        await user.save();
        const tokens = AuthService.generateTokens(user);
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`
        );
      }
    );
  }
  static {
    // Microsoft OAuth callback
    this.microsoftOAuthCallback = asyncHandler(
      async (req, res, _next) => {
        const { code } = req.query;
        if (!code) {
          throw new ApiError_default(400, "Authorization code is required");
        }
        const profile = {
          email: "user@outlook.com",
          firstName: "Jane",
          lastName: "Smith",
          profilePicture: "https://..."
        };
        const user = await AuthService.handleOAuthUser(profile);
        user.lastLogin = /* @__PURE__ */ new Date();
        await user.save();
        const tokens = AuthService.generateTokens(user);
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`
        );
      }
    );
  }
  static {
    // Refresh access token
    this.refreshToken = asyncHandler(
      async (req, res, _next) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
          throw new ApiError_default(400, "Refresh token is required");
        }
        const userId = AuthService.verifyRefreshToken(refreshToken);
        const user = await User_model_default.findOne({ userId });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        if (!user.isActive) {
          throw new ApiError_default(403, "Account is deactivated");
        }
        const tokens = AuthService.generateTokens(user);
        res.status(200).json({
          success: true,
          message: "Token refreshed successfully",
          data: tokens
        });
      }
    );
  }
  static {
    // Logout
    this.logout = asyncHandler(
      async (_req, res, _next) => {
        res.status(200).json({
          success: true,
          message: "Logged out successfully"
        });
      }
    );
  }
  static {
    // Get current user profile
    this.getCurrentUser = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const user = await User_model_default.findOne({ userId }).select("-__v");
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        const author = await Author_model_default.findOne({ userId: user.userId }).select("-__v");
        res.status(200).json({
          success: true,
          data: {
            user,
            author
          }
        });
      }
    );
  }
  static {
    // Update user profile
    this.updateProfile = asyncHandler(
      async (req, res, _next) => {
        const { firstName, lastName } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const user = await User_model_default.findOne({ userId });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        await user.save();
        res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          data: { user }
        });
      }
    );
  }
  static {
    // Change email
    this.changeEmail = asyncHandler(
      async (req, res, _next) => {
        const { newEmail, otp } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (!newEmail || !otp) {
          throw new ApiError_default(400, "New email and OTP are required");
        }
        const isValid = await AuthService.verifyOTP(newEmail, otp, "reset");
        if (!isValid) {
          throw new ApiError_default(400, "Invalid or expired OTP");
        }
        const existingUser = await User_model_default.findOne({ email: newEmail });
        if (existingUser) {
          throw new ApiError_default(400, "Email already in use");
        }
        const user = await User_model_default.findOne({ userId });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        user.email = newEmail;
        await user.save();
        res.status(200).json({
          success: true,
          message: "Email updated successfully"
        });
      }
    );
  }
  static {
    // Enable 2FA (placeholder)
    this.enable2FA = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const user = await User_model_default.findOne({ userId });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        const result = {
          secret: "TEMP_SECRET",
          qrCode: "data:image/png;base64,...",
          backupCodes: ["CODE1", "CODE2", "CODE3"]
        };
        res.status(200).json({
          success: true,
          message: "2FA enabled successfully",
          data: result
        });
      }
    );
  }
  static {
    // Verify 2FA (placeholder)
    this.verify2FA = asyncHandler(
      async (req, res, _next) => {
        const { token } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (!token) {
          throw new ApiError_default(400, "Token is required");
        }
        const user = await User_model_default.findOne({ userId });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        const isValid = token.length === 6;
        if (!isValid) {
          throw new ApiError_default(400, "Invalid 2FA token");
        }
        res.status(200).json({
          success: true,
          message: "2FA verified successfully"
        });
      }
    );
  }
  static {
    // Disable 2FA (placeholder)
    this.disable2FA = asyncHandler(
      async (req, res, _next) => {
        const { token } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (!token) {
          throw new ApiError_default(400, "Token is required");
        }
        const user = await User_model_default.findOne({ userId });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        const isValid = token.length === 6;
        if (!isValid) {
          throw new ApiError_default(400, "Invalid 2FA token");
        }
        res.status(200).json({
          success: true,
          message: "2FA disabled successfully"
        });
      }
    );
  }
};

// src/middlewares/auth.middleware.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var verifyToken = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError_default(401, "No token provided");
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = import_jsonwebtoken2.default.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof import_jsonwebtoken2.default.TokenExpiredError) {
        throw new ApiError_default(401, "Token expired");
      }
      throw new ApiError_default(401, "Invalid token");
    }
  } catch (error) {
    next(error);
  }
};

// src/middlewares/validate.middleware.ts
var validate = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return next(new ApiError_default(400, errorMessage));
    }
    req.body = value;
    next();
  };
};

// src/validators/auth.validator.ts
var import_joi = __toESM(require("joi"));
var authValidation = {
  sendOTP: import_joi.default.object({
    email: import_joi.default.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required"
    }),
    type: import_joi.default.string().valid("signup", "login", "reset").required().messages({
      "any.only": "Type must be either signup, login, or reset",
      "any.required": "Type is required"
    })
  }),
  verifyOTPSignup: import_joi.default.object({
    email: import_joi.default.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required"
    }),
    otp: import_joi.default.string().length(6).pattern(/^[0-9]+$/).required().messages({
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required"
    }),
    firstName: import_joi.default.string().min(2).max(50).required().messages({
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required"
    }),
    lastName: import_joi.default.string().min(2).max(50).required().messages({
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required"
    }),
    referralCode: import_joi.default.string().uppercase().optional().messages({
      "string.uppercase": "Referral code must be uppercase"
    })
  }),
  verifyOTPLogin: import_joi.default.object({
    email: import_joi.default.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required"
    }),
    otp: import_joi.default.string().length(6).pattern(/^[0-9]+$/).required().messages({
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required"
    })
  }),
  refreshToken: import_joi.default.object({
    refreshToken: import_joi.default.string().required().messages({
      "any.required": "Refresh token is required"
    })
  }),
  updateProfile: import_joi.default.object({
    firstName: import_joi.default.string().min(2).max(50).optional().messages({
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters"
    }),
    lastName: import_joi.default.string().min(2).max(50).optional().messages({
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters"
    })
  }),
  changeEmail: import_joi.default.object({
    newEmail: import_joi.default.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "New email is required"
    }),
    otp: import_joi.default.string().length(6).pattern(/^[0-9]+$/).required().messages({
      "string.length": "OTP must be 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
      "any.required": "OTP is required"
    })
  }),
  verify2FA: import_joi.default.object({
    token: import_joi.default.string().length(6).pattern(/^[0-9]+$/).required().messages({
      "string.length": "2FA token must be 6 digits",
      "string.pattern.base": "2FA token must contain only numbers",
      "any.required": "2FA token is required"
    })
  })
};

// src/routes/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/send-otp", validate(authValidation.sendOTP), AuthController.sendOTP);
router.post("/verify-otp-signup", validate(authValidation.verifyOTPSignup), AuthController.verifyOTPSignup);
router.post("/verify-otp-login", validate(authValidation.verifyOTPLogin), AuthController.verifyOTPLogin);
router.post("/refresh-token", validate(authValidation.refreshToken), AuthController.refreshToken);
router.get("/google", (_req, res) => {
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=profile email`
  );
});
router.get("/google/callback", AuthController.googleOAuthCallback);
router.get("/microsoft", (_req, res) => {
  res.redirect(
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&redirect_uri=${process.env.MICROSOFT_CALLBACK_URL}&response_type=code&scope=openid profile email`
  );
});
router.get("/microsoft/callback", AuthController.microsoftOAuthCallback);
router.use(verifyToken);
router.get("/me", AuthController.getCurrentUser);
router.put("/profile", validate(authValidation.updateProfile), AuthController.updateProfile);
router.post("/change-email", validate(authValidation.changeEmail), AuthController.changeEmail);
router.post("/logout", AuthController.logout);
router.post("/2fa/enable", AuthController.enable2FA);
router.post("/2fa/verify", validate(authValidation.verify2FA), AuthController.verify2FA);
router.post("/2fa/disable", validate(authValidation.verify2FA), AuthController.disable2FA);
var auth_routes_default = router;

// src/routes/admin-auth.routes.ts
var import_express2 = require("express");

// src/controllers/admin-auth.controller.ts
var adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User_model_default.findOne({
    email,
    role: { $in: ["super_admin", "sub_admin"] }
  }).select("+password");
  if (!user) {
    throw new ApiError_default(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new ApiError_default(403, "Account is deactivated. Please contact support.");
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError_default(401, "Invalid email or password");
  }
  user.lastLogin = /* @__PURE__ */ new Date();
  await user.save();
  const tokens = AuthService.generateTokens(user);
  const userData = {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    permissions: user.permissions
  };
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: userData,
      tokens
    }
  });
});
var changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;
  const user = await User_model_default.findOne({ userId }).select("+password");
  if (!user) {
    throw new ApiError_default(404, "User not found");
  }
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError_default(401, "Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully"
  });
});
var forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User_model_default.findOne({
    email,
    role: { $in: ["super_admin", "sub_admin"] }
  });
  if (!user) {
    res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent."
    });
    return;
  }
  const resetToken = await AuthService.storePasswordResetToken(email);
  const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password?token=${resetToken}`;
  await EmailService.sendAdminPasswordResetEmail(user.email, user.getFullName(), resetLink);
  res.status(200).json({
    success: true,
    message: "If an account exists with this email, a password reset link has been sent."
  });
});
var resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const email = await AuthService.verifyPasswordResetToken(token);
  if (!email) {
    throw new ApiError_default(400, "Invalid or expired reset token");
  }
  const user = await User_model_default.findOne({
    email,
    role: { $in: ["super_admin", "sub_admin"] }
  }).select("+password");
  if (!user) {
    throw new ApiError_default(404, "User not found");
  }
  user.password = newPassword;
  await user.save();
  const crypto5 = require("crypto");
  const hashedToken = crypto5.createHash("sha256").update(token).digest("hex");
  await (init_OTP_model(), __toCommonJS(OTP_model_exports)).default.deleteOne({ otp: hashedToken, type: "reset" });
  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login with your new password."
  });
});

// src/validators/admin-auth.validator.ts
var import_joi2 = __toESM(require("joi"));
var adminLoginSchema = import_joi2.default.object({
  email: import_joi2.default.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  }),
  password: import_joi2.default.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required"
  })
});
var changePasswordSchema = import_joi2.default.object({
  currentPassword: import_joi2.default.string().required().messages({
    "any.required": "Current password is required"
  }),
  newPassword: import_joi2.default.string().min(8).required().messages({
    "string.min": "New password must be at least 8 characters",
    "any.required": "New password is required"
  }),
  confirmPassword: import_joi2.default.string().valid(import_joi2.default.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required"
  })
});
var forgotPasswordSchema = import_joi2.default.object({
  email: import_joi2.default.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  })
});
var resetPasswordSchema = import_joi2.default.object({
  token: import_joi2.default.string().required().messages({
    "any.required": "Reset token is required"
  }),
  newPassword: import_joi2.default.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "New password is required"
  }),
  confirmPassword: import_joi2.default.string().valid(import_joi2.default.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required"
  })
});

// src/routes/admin-auth.routes.ts
var router2 = (0, import_express2.Router)();
router2.post("/login", validate(adminLoginSchema), adminLogin);
router2.post("/change-password", verifyToken, validate(changePasswordSchema), changePassword);
router2.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router2.post("/reset-password", validate(resetPasswordSchema), resetPassword);
var admin_auth_routes_default = router2;

// src/routes/author-auth.routes.ts
var import_express3 = require("express");

// src/controllers/author-auth.controller.ts
var import_crypto2 = __toESM(require("crypto"));
init_OTP_model();

// src/utils/password.util.ts
var validateAuthorPassword = (password, _firstName) => {
  const errors = {};
  const numbers = password.match(/\d/g);
  const numberCount = numbers ? numbers.length : 0;
  if (numberCount < 3) {
    errors.insufficientNumbers = true;
  }
  const minLength = password.length >= 4;
  if (!minLength) {
    errors.tooShort = true;
  }
  return {
    valid: numberCount >= 3 && minLength,
    errors
  };
};

// src/controllers/author-auth.controller.ts
var sendSignupOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existingUser = await User_model_default.findOne({ email });
  if (existingUser) {
    throw new ApiError_default(400, "An account with this email already exists");
  }
  const otp = await AuthService.storeOTP(email, "signup");
  await EmailService.sendOTPEmail(email, otp, "signup");
  res.status(200).json({
    success: true,
    message: "OTP sent successfully to your email"
  });
});
var checkOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError_default(400, "Email and OTP are required");
  const hashedOTP = import_crypto2.default.createHash("sha256").update(String(otp)).digest("hex");
  const otpRecord = await OTP_model_default.findOne({
    email,
    type: "signup",
    otp: hashedOTP,
    expiresAt: { $gt: /* @__PURE__ */ new Date() }
  });
  if (!otpRecord) {
    const existing = await OTP_model_default.findOne({ email, type: "signup", expiresAt: { $gt: /* @__PURE__ */ new Date() } });
    if (existing) {
      existing.attempts += 1;
      await existing.save();
      if (existing.attempts >= 3) {
        await OTP_model_default.deleteOne({ _id: existing._id });
        throw new ApiError_default(400, "Maximum OTP attempts exceeded. Please request a new OTP.");
      }
    }
    throw new ApiError_default(400, "Invalid or expired OTP");
  }
  res.status(200).json({ success: true, message: "OTP verified" });
});
var verifyOTPAndRegister = asyncHandler(async (req, res) => {
  const { email, otp, firstName, lastName, mobile, password, referralCode } = req.body;
  const passwordValidation = validateAuthorPassword(password);
  if (!passwordValidation.valid) {
    const errors = passwordValidation.errors;
    let errorMessage = "Password does not meet requirements: ";
    if (errors.insufficientNumbers) {
      errorMessage += "must include at least 3 numbers; ";
    }
    if (errors.tooShort) {
      errorMessage += "must be at least 4 characters; ";
    }
    throw new ApiError_default(400, errorMessage.trim());
  }
  const isOTPValid = await AuthService.verifyOTP(email, otp, "signup");
  if (!isOTPValid) {
    throw new ApiError_default(400, "Invalid or expired OTP");
  }
  const existingUser = await User_model_default.findOne({ email });
  if (existingUser) {
    throw new ApiError_default(400, "An account with this email already exists");
  }
  const { user } = await AuthService.createAuthor({
    firstName: firstName.trim(),
    lastName: (lastName || "").trim(),
    email,
    password,
    referralCode: referralCode?.trim()
  });
  if (mobile) {
    user.mobile = mobile;
  }
  user.lastLogin = /* @__PURE__ */ new Date();
  await user.save();
  const tokens = AuthService.generateTokens(user);
  await EmailService.sendWelcomeEmail(email, user.getFullName(), password);
  const userData = {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    isRestricted: user.isRestricted
  };
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: userData,
      tokens
    }
  });
});
var authorLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User_model_default.findOne({
    email,
    role: "author"
  }).select("+password");
  if (!user) {
    throw new ApiError_default(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new ApiError_default(403, "Account is deactivated. Please contact support.");
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError_default(401, "Invalid email or password");
  }
  user.lastLogin = /* @__PURE__ */ new Date();
  await user.save();
  const tokens = AuthService.generateTokens(user);
  const userData = {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    tier: user.tier,
    isActive: user.isActive,
    isRestricted: user.isRestricted
  };
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: userData,
      tokens
    }
  });
});
var sendLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User_model_default.findOne({ email, role: "author" });
  if (!user) {
    res.status(200).json({
      success: true,
      message: "If an account exists with this email, an OTP has been sent."
    });
    return;
  }
  const otp = await AuthService.storeOTP(email, "reset");
  await EmailService.sendOTPEmail(email, otp, "reset");
  res.status(200).json({
    success: true,
    message: "If an account exists with this email, an OTP has been sent."
  });
});
var verifyLoginOTP = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User_model_default.findOne({ email, role: "author" }).select("+password");
  if (!user) {
    throw new ApiError_default(404, "User not found");
  }
  const passwordValidation = validateAuthorPassword(newPassword);
  if (!passwordValidation.valid) {
    const errors = passwordValidation.errors;
    let errorMessage = "Password does not meet requirements: ";
    if (errors.insufficientNumbers) {
      errorMessage += "must include at least 3 numbers; ";
    }
    if (errors.tooShort) {
      errorMessage += "must be at least 4 characters; ";
    }
    throw new ApiError_default(400, errorMessage.trim());
  }
  const isOTPValid = await AuthService.verifyOTP(email, otp, "reset");
  if (!isOTPValid) {
    throw new ApiError_default(400, "Invalid or expired OTP");
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login with your new password."
  });
});

// src/validators/author-auth.validator.ts
var import_joi3 = __toESM(require("joi"));
var sendSignupOTPSchema = import_joi3.default.object({
  email: import_joi3.default.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  })
});
var verifyOTPAndRegisterSchema = import_joi3.default.object({
  email: import_joi3.default.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  }),
  otp: import_joi3.default.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "any.required": "OTP is required"
  }),
  firstName: import_joi3.default.string().min(2).max(50).required().messages({
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required"
  }),
  lastName: import_joi3.default.string().min(1).max(50).optional().allow("").messages({
    "string.max": "Last name cannot exceed 50 characters"
  }),
  mobile: import_joi3.default.string().optional().allow(""),
  password: import_joi3.default.string().min(4).required().messages({
    "string.min": "Password must be at least 4 characters",
    "any.required": "Password is required"
  }),
  referralCode: import_joi3.default.string().optional().allow("")
});
var authorLoginSchema = import_joi3.default.object({
  email: import_joi3.default.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  }),
  password: import_joi3.default.string().required().messages({
    "any.required": "Password is required"
  })
});
var sendLoginOTPSchema = import_joi3.default.object({
  email: import_joi3.default.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  })
});
var verifyLoginOTPSchema = import_joi3.default.object({
  email: import_joi3.default.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required"
  }),
  otp: import_joi3.default.string().length(6).required().messages({
    "string.length": "OTP must be 6 digits",
    "any.required": "OTP is required"
  }),
  newPassword: import_joi3.default.string().min(4).required().messages({
    "string.min": "Password must be at least 4 characters",
    "any.required": "New password is required"
  })
});

// src/routes/author-auth.routes.ts
var router3 = (0, import_express3.Router)();
router3.post("/send-signup-otp", validate(sendSignupOTPSchema), sendSignupOTP);
router3.post("/check-otp", checkOTP);
router3.post("/verify-otp-signup", validate(verifyOTPAndRegisterSchema), verifyOTPAndRegister);
router3.post("/login", validate(authorLoginSchema), authorLogin);
router3.post("/send-login-otp", validate(sendLoginOTPSchema), sendLoginOTP);
router3.post("/verify-login-otp", validate(verifyLoginOTPSchema), verifyLoginOTP);
var author_auth_routes_default = router3;

// src/routes/admin.routes.ts
var import_express4 = require("express");

// src/models/Transaction.model.ts
var import_mongoose7 = __toESM(require("mongoose"));
var TransactionSchema = new import_mongoose7.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    authorId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    bookId: {
      type: String,
      ref: "Book"
    },
    type: {
      type: String,
      enum: ["book_payment", "royalty_payment", "referral_earning", "adjustment", "refund"],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["bank_transfer", "upi", "other"]
    },
    bankAccountId: {
      type: String,
      ref: "BankAccount"
    },
    paymentProof: {
      type: String
    },
    paymentDate: {
      type: Date
    },
    metadata: {
      type: import_mongoose7.Schema.Types.Mixed
    },
    createdBy: {
      type: String,
      required: true,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);
TransactionSchema.index({ authorId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
var Transaction_model_default = import_mongoose7.default.model("Transaction", TransactionSchema);

// src/models/BankAccount.model.ts
var import_mongoose8 = __toESM(require("mongoose"));
var BankAccountSchema = new import_mongoose8.Schema(
  {
    authorId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    bankName: {
      type: String,
      required: true,
      trim: true
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    accountNumberEncrypted: {
      type: String,
      required: true
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    branchName: {
      type: String,
      required: true,
      trim: true
    },
    accountType: {
      type: String,
      enum: ["primary", "secondary"],
      default: "secondary"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
BankAccountSchema.index({ authorId: 1, accountType: 1 });
var BankAccount_model_default = import_mongoose8.default.model("BankAccount", BankAccountSchema);

// src/models/Ticket.model.ts
var import_mongoose9 = __toESM(require("mongoose"));
var TicketSchema = new import_mongoose9.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    authorId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "closed"],
      default: "pending"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    discussionDay: {
      type: String,
      trim: true
    },
    discussionTimeSlot1: {
      type: String,
      trim: true
    },
    discussionTimeSlot2: {
      type: String,
      trim: true
    },
    attachments: [{
      type: String
    }],
    assignedTo: {
      type: String,
      ref: "User"
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
TicketSchema.index({ status: 1, createdAt: -1 });
TicketSchema.index({ authorId: 1, status: 1 });
TicketSchema.index({ title: "text", description: "text" });
var Ticket_model_default = import_mongoose9.default.model("Ticket", TicketSchema);

// src/models/PricingConfig.model.ts
var import_mongoose10 = __toESM(require("mongoose"));
var priceField = {
  main: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 }
};
var PricingConfigSchema = new import_mongoose10.Schema(
  {
    language: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    publishingPrice: priceField,
    coverDesignPrice: priceField,
    distributionPrice: priceField,
    copyrightPrice: priceField,
    formattingPrice: priceField,
    perBookCopyPrice: priceField,
    installmentOptions: [{
      label: { type: String, required: true },
      splits: [{ type: Number, required: true }]
    }],
    referralConfig: {
      firstBookBonus: { type: Number, default: 0, min: 0 },
      perReferralBonus: { type: Number, default: 0, min: 0 }
    },
    platforms: [{
      type: String,
      trim: true
    }],
    benefits: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);
var PricingConfig_model_default = import_mongoose10.default.model("PricingConfig", PricingConfigSchema);

// src/models/AuditLog.model.ts
var import_mongoose11 = __toESM(require("mongoose"));
var AuditLogSchema = new import_mongoose11.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "read",
        "update",
        "delete",
        "login",
        "logout",
        "restrict",
        "activate",
        "payment",
        "status_change",
        "other"
      ]
    },
    resource: {
      type: String,
      required: true
    },
    resourceId: {
      type: String
    },
    details: {
      type: import_mongoose11.Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
var AuditLog_model_default = import_mongoose11.default.model("AuditLog", AuditLogSchema);

// src/constants/permissions.ts
var MODULES = [
  "authors",
  "books",
  "selling",
  "royalties",
  "support",
  "reviews",
  "payments",
  "calculator",
  "analytics"
];

// src/controllers/admin.controller.ts
async function getAuthorUserInfo(authorId) {
  const author = await Author_model_default.findOne({ authorId });
  if (!author) return null;
  const user = await User_model_default.findOne({ userId: author.userId });
  if (!user) return null;
  return { author, user, email: user.email, name: user.firstName };
}
var AdminController = class {
  static {
    // Create author account by admin (with auto-generated password)
    this.createAuthor = asyncHandler(
      async (req, res, _next) => {
        const { firstName, lastName, email, mobile, referralCode, pinCode, city, district, state, country, housePlot, landmark } = req.body;
        if (!firstName || !lastName || !email) {
          throw new ApiError_default(400, "First name, last name, and email are required");
        }
        const existingUser = await User_model_default.findOne({ email });
        if (existingUser) {
          throw new ApiError_default(400, "Email already registered");
        }
        const nameBase = firstName.toLowerCase().replace(/[^a-z]/g, "");
        const namePart = nameBase.length >= 4 ? nameBase.slice(0, 4) : nameBase + "0".repeat(4 - nameBase.length);
        const digits = Math.floor(Math.random() * 900 + 100).toString();
        const password = `${namePart}@${digits}`;
        const result = await AuthService.createAuthor({
          email,
          firstName,
          lastName,
          password,
          referralCode
        });
        if (mobile) {
          await User_model_default.findOneAndUpdate({ userId: result.user.userId }, { mobile });
        }
        const authorUpdate = {};
        if (pinCode || city || district || state || country || housePlot || landmark) {
          authorUpdate.address = {
            pinCode: pinCode || "",
            city: city || "",
            district: district || "",
            state: state || "",
            country: country || "India",
            housePlot: housePlot || "",
            landmark: landmark || ""
          };
        }
        if (Object.keys(authorUpdate).length > 0) {
          await Author_model_default.findOneAndUpdate({ authorId: result.author.authorId }, authorUpdate);
        }
        await EmailService.sendAdminCreatedAuthorEmail(
          email,
          firstName,
          result.author.authorId,
          password,
          result.author.referralCode
        );
        const userId = req.user?.userId;
        if (userId) {
          await AuditLog_model_default.create({
            userId,
            action: "create",
            resource: "Author",
            resourceId: result.author.authorId,
            details: {
              adminId: userId,
              createdAuthorId: result.author.authorId,
              email
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(201).json({
          success: true,
          message: "Author account created successfully. Credentials sent to email.",
          data: {
            user: {
              userId: result.user.userId,
              firstName: result.user.firstName,
              lastName: result.user.lastName,
              email: result.user.email,
              role: result.user.role,
              tier: result.user.tier
            },
            author: {
              authorId: result.author.authorId,
              referralCode: result.author.referralCode
            }
          }
        });
      }
    );
  }
  static {
    // Get all authors with filters
    this.getAllAuthors = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          search,
          tier,
          isRestricted,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;
        const filter = {};
        if (search) {
          const users2 = await User_model_default.find({
            $or: [
              { firstName: new RegExp(search, "i") },
              { lastName: new RegExp(search, "i") },
              { email: new RegExp(search, "i") }
            ]
          }).select("userId");
          filter.userId = { $in: users2.map((u) => u.userId) };
        }
        if (tier) {
          const users2 = await User_model_default.find({ tier }).select("userId");
          filter.userId = { $in: users2.map((u) => u.userId) };
        }
        if (isRestricted !== void 0) {
          filter.isRestricted = isRestricted === "true";
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const [authors, total] = await Promise.all([
          Author_model_default.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
          Author_model_default.countDocuments(filter)
        ]);
        const userIds = authors.map((a) => a.userId);
        const authorIds = authors.map((a) => a.authorId);
        const [users, bookUnitsAgg] = await Promise.all([
          User_model_default.find({ userId: { $in: userIds } }).select("userId firstName lastName email mobile tier isActive").lean(),
          Book_model_default.aggregate([
            { $match: { authorId: { $in: authorIds } } },
            { $group: { _id: "$authorId", totalUnits: { $sum: "$totalSellingUnits" } } }
          ])
        ]);
        const userMap = new Map(users.map((u) => [u.userId, u]));
        const bookUnitsMap = new Map(bookUnitsAgg.map((b) => [b._id, b.totalUnits]));
        const authorsWithUsers = authors.map((author) => ({
          ...author,
          totalSoldUnits: bookUnitsMap.get(author.authorId) || 0,
          user: userMap.get(author.userId) || null
        }));
        res.status(200).json({
          success: true,
          data: {
            authors: authorsWithUsers,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Get author details
    this.getAuthorDetails = asyncHandler(
      async (req, res, _next) => {
        const { authorId } = req.params;
        const authorDoc = await Author_model_default.findOne({ authorId }).lean();
        if (!authorDoc) {
          throw new ApiError_default(404, "Author not found");
        }
        const user = await User_model_default.findOne({ userId: authorDoc.userId }).select("userId firstName lastName email mobile tier isActive lastLogin").lean();
        const [books, bankAccounts, transactions] = await Promise.all([
          Book_model_default.find({ authorId }).sort({ createdAt: -1 }),
          BankAccount_model_default.find({ authorId }),
          Transaction_model_default.find({ authorId }).sort({ createdAt: -1 }).limit(10)
        ]);
        res.status(200).json({
          success: true,
          data: {
            author: { ...authorDoc, user },
            books,
            bankAccounts,
            recentTransactions: transactions
          }
        });
      }
    );
  }
  static {
    // Update author tier
    this.updateAuthorTier = asyncHandler(
      async (req, res, _next) => {
        const { authorId } = req.params;
        const { tier } = req.body;
        if (!tier) {
          throw new ApiError_default(400, "Tier is required");
        }
        const author = await Author_model_default.findOne({ authorId });
        if (!author) {
          throw new ApiError_default(404, "Author not found");
        }
        const user = await User_model_default.findOne({ userId: author.userId });
        if (!user) {
          throw new ApiError_default(404, "User not found");
        }
        const oldTier = user.tier;
        user.tier = tier;
        await user.save();
        const userId = req.user?.userId;
        if (userId) {
          await AuditLog_model_default.create({
            userId,
            action: "update",
            resource: "Author",
            resourceId: authorId,
            details: {
              adminId: userId,
              oldTier,
              newTier: tier
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(200).json({
          success: true,
          message: "Author tier updated successfully",
          data: { user }
        });
      }
    );
  }
  static {
    // Restrict/Unrestrict author
    this.restrictAuthor = asyncHandler(
      async (req, res, _next) => {
        const { authorId } = req.params;
        const { isRestricted, restrictionReason } = req.body;
        const author = await Author_model_default.findOne({ authorId });
        if (!author) {
          throw new ApiError_default(404, "Author not found");
        }
        author.isRestricted = isRestricted;
        author.restrictionReason = isRestricted ? restrictionReason : void 0;
        await author.save();
        const userId = req.user?.userId;
        if (userId) {
          await AuditLog_model_default.create({
            userId,
            action: isRestricted ? "restrict" : "activate",
            resource: "Author",
            resourceId: authorId,
            details: {
              adminId: userId,
              reason: restrictionReason
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(200).json({
          success: true,
          message: `Author ${isRestricted ? "restricted" : "unrestricted"} successfully`,
          data: { author }
        });
      }
    );
  }
  static {
    // Approve/Reject book
    this.updateBookStatus = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { status, rejectionReason } = req.body;
        if (!status) {
          throw new ApiError_default(400, "Status is required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const oldStatus = book.status;
        book.status = status;
        if (status === "rejected" && rejectionReason) {
          book.rejectionReason = rejectionReason;
        }
        if (status === "published" && !book.actualLaunchDate) {
          book.actualLaunchDate = /* @__PURE__ */ new Date();
        }
        await book.save();
        if (status === "published" && oldStatus !== "published") {
          const author = await Author_model_default.findOne({ authorId: book.authorId });
          if (author) {
            author.totalBooks += 1;
            await author.save();
          }
        }
        const userId = req.user?.userId;
        if (userId) {
          await AuditLog_model_default.create({
            userId,
            action: "status_change",
            resource: "Book",
            resourceId: bookId,
            details: {
              adminId: userId,
              oldStatus,
              newStatus: status,
              rejectionReason
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(200).json({
          success: true,
          message: `Book ${status} successfully`,
          data: { book }
        });
      }
    );
  }
  static {
    // Get all books with filters
    this.getAllBooks = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          search,
          status,
          bookType,
          authorId,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;
        const filter = {};
        if (search) {
          filter.$or = [
            { bookName: new RegExp(search, "i") },
            { bookId: new RegExp(search, "i") },
            { subtitle: new RegExp(search, "i") }
          ];
        }
        if (status) {
          filter.status = status;
        }
        if (bookType) {
          filter.bookType = bookType;
        }
        if (authorId) {
          filter.authorId = authorId;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const [books, total] = await Promise.all([
          Book_model_default.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
          Book_model_default.countDocuments(filter)
        ]);
        const authorIds = [...new Set(books.map((b) => b.authorId))];
        const authors = await Author_model_default.find({ authorId: { $in: authorIds } }).lean();
        const userIds = authors.map((a) => a.userId);
        const users = await User_model_default.find({ userId: { $in: userIds } }).select("userId firstName lastName email").lean();
        const userMap = new Map(users.map((u) => [u.userId, u]));
        const authorMap = new Map(authors.map((a) => [a.authorId, { ...a, user: userMap.get(a.userId) || null }]));
        const booksWithAuthors = books.map((book) => ({
          ...book,
          author: authorMap.get(book.authorId) || null,
          authorName: (() => {
            const a = authorMap.get(book.authorId);
            const u = a ? userMap.get(a.userId) : null;
            return u ? `${u.firstName} ${u.lastName}`.trim() : book.authorId;
          })(),
          sellingUnits: book.totalSellingUnits ?? 0,
          netEarnings: book.totalRevenue ?? 0
        }));
        res.status(200).json({
          success: true,
          data: {
            books: booksWithAuthors,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Get all support tickets
    this.getAllTickets = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          status,
          priority,
          category,
          search,
          fromDate,
          toDate,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;
        const filter = {};
        if (status) {
          filter.status = status;
        }
        if (priority) {
          filter.priority = priority;
        }
        if (category) {
          filter.category = category;
        }
        if (fromDate || toDate) {
          filter.createdAt = {};
          if (fromDate) filter.createdAt.$gte = new Date(fromDate);
          if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = to;
          }
        }
        let authorIdFilter = null;
        if (search) {
          const searchRegex = new RegExp(search, "i");
          const matchingUsers = await User_model_default.find({
            $or: [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { email: searchRegex }
            ]
          }).select("userId").lean();
          const matchingUserIds = matchingUsers.map((u) => u.userId);
          const matchingAuthors = await Author_model_default.find({
            $or: [
              { userId: { $in: matchingUserIds } },
              { authorId: searchRegex }
            ]
          }).select("authorId").lean();
          authorIdFilter = matchingAuthors.map((a) => a.authorId);
          filter.authorId = { $in: authorIdFilter };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const [tickets, total] = await Promise.all([
          Ticket_model_default.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
          Ticket_model_default.countDocuments(filter)
        ]);
        const authorIds = [...new Set(tickets.map((t) => t.authorId))];
        const authors = await Author_model_default.find({ authorId: { $in: authorIds } }).lean();
        const authorUserIds = authors.map((a) => a.userId);
        const users = await User_model_default.find({ userId: { $in: authorUserIds } }).select("userId firstName lastName").lean();
        const userMap = new Map(users.map((u) => [u.userId, u]));
        const authorMap = new Map(
          authors.map((a) => {
            const u = userMap.get(a.userId);
            return [a.authorId, u ? `${u.firstName} ${u.lastName}` : "Unknown"];
          })
        );
        const ticketsWithAuthors = tickets.map((t) => ({
          ...t,
          authorName: authorMap.get(t.authorId) || "Unknown Author"
        }));
        res.status(200).json({
          success: true,
          data: {
            tickets: ticketsWithAuthors,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Get bank accounts for a specific author (admin use — for royalty release modal)
    this.getAuthorBankAccounts = asyncHandler(
      async (req, res, _next) => {
        const { authorId } = req.params;
        const author = await Author_model_default.findOne({ authorId });
        if (!author) throw new ApiError_default(404, "Author not found");
        const bankAccounts = await BankAccount_model_default.find({ authorId, isActive: true });
        res.status(200).json({
          success: true,
          data: { bankAccounts }
        });
      }
    );
  }
  static {
    // Get platform statistics
    this.getPlatformStats = asyncHandler(
      async (_req, res, _next) => {
        const [
          totalAuthors,
          activeAuthors,
          publishedBooks,
          ongoingBooksCount,
          totalRevenue,
          totalTransactions,
          activeTickets
        ] = await Promise.all([
          Author_model_default.countDocuments(),
          Author_model_default.countDocuments({ isRestricted: false }),
          Book_model_default.countDocuments({ status: "published" }),
          Book_model_default.countDocuments({
            status: { $in: ["pending", "payment_pending", "in_progress", "formatting", "designing", "printing"] }
          }),
          Transaction_model_default.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.countDocuments(),
          Ticket_model_default.countDocuments({ status: { $in: ["pending", "in_progress"] } })
        ]);
        const sellingUnitsAgg = await Book_model_default.aggregate([
          { $group: { _id: null, total: { $sum: "$totalSellingUnits" } } }
        ]);
        const bookSellingUnits = sellingUnitsAgg[0]?.total || 0;
        const bookRevenueAgg = await Book_model_default.aggregate([
          { $group: { _id: null, total: { $sum: "$paymentStatus.paidAmount" } } }
        ]);
        const totalBookRevenue = bookRevenueAgg[0]?.total || 0;
        const netProfitMargin = Math.round(totalBookRevenue);
        const sixMonthsAgo = /* @__PURE__ */ new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const monthlyBooks = await Book_model_default.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        const monthlyAuthors = await Author_model_default.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        const sellingByAuthor = await Book_model_default.aggregate([
          { $group: { _id: "$authorId", totalUnits: { $sum: "$totalSellingUnits" }, totalPaid: { $sum: "$paymentStatus.paidAmount" } } },
          { $sort: { totalUnits: -1 } },
          { $limit: 10 }
        ]);
        const topAuthorIds = sellingByAuthor.map((s) => s._id);
        const [topAuthors, topUsers] = await Promise.all([
          Author_model_default.find({ authorId: { $in: topAuthorIds } }).lean(),
          User_model_default.find({}).lean()
          // will be filtered below
        ]);
        const existingIds = new Set(topAuthorIds);
        if (topAuthorIds.length < 10) {
          const extra = await Author_model_default.find({ authorId: { $nin: Array.from(existingIds) } }).sort({ createdAt: -1 }).limit(10 - topAuthorIds.length).lean();
          extra.forEach((a) => {
            if (!existingIds.has(a.authorId)) {
              topAuthors.push(a);
              sellingByAuthor.push({ _id: a.authorId, totalUnits: 0, totalPaid: 0 });
            }
          });
        }
        const bestSellers = await Promise.all(
          topAuthors.map(async (author) => {
            const user = topUsers.find((u) => u.userId === author.userId);
            const salesEntry = sellingByAuthor.find((s) => s._id === author.authorId);
            const lastTxn = await Transaction_model_default.findOne({
              authorId: author.authorId,
              status: "completed"
            }).sort({ createdAt: -1 }).lean();
            return {
              id: author._id?.toString(),
              name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown",
              authorId: author.authorId,
              photo: author.profilePicture || "",
              lastPayment: lastTxn ? `\u20B9${(lastTxn.amount || 0).toLocaleString("en-IN")}` : "\u2014",
              totalPayment: `\u20B9${(salesEntry?.totalPaid || 0).toLocaleString("en-IN")}`,
              bookSellingUnit: salesEntry?.totalUnits || 0,
              status: author.isRestricted ? "Inactive" : "Active"
            };
          })
        );
        const tierDistribution = await User_model_default.aggregate([
          { $match: { role: "author" } },
          { $group: { _id: "$tier", count: { $sum: 1 } } }
        ]);
        res.status(200).json({
          success: true,
          data: {
            totalAuthors,
            activeAuthors,
            publishedBooks,
            ongoingBooks: ongoingBooksCount,
            bookSellingUnits,
            netProfitMargin,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalTransactions,
            activeTickets,
            bestSellers,
            monthlyBooks,
            monthlyAuthors,
            tierDistribution
          }
        });
      }
    );
  }
  static {
    // Manage pricing configuration
    this.updatePricingConfig = asyncHandler(
      async (req, res, _next) => {
        const { language, bookType, priceRange } = req.body;
        if (!language || !bookType || !priceRange) {
          throw new ApiError_default(400, "Language, book type, and price range are required");
        }
        let config2 = await PricingConfig_model_default.findOne({ language, bookType });
        if (config2) {
          config2.priceRange = priceRange;
          await config2.save();
        } else {
          config2 = await PricingConfig_model_default.create({
            language,
            bookType,
            priceRange
          });
        }
        const userId = req.user?.userId;
        if (userId) {
          await AuditLog_model_default.create({
            userId,
            action: "update",
            resource: "PricingConfig",
            resourceId: config2._id.toString(),
            details: {
              adminId: userId,
              language,
              bookType,
              priceRange
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(200).json({
          success: true,
          message: "Pricing configuration updated successfully",
          data: { config: config2 }
        });
      }
    );
  }
  static {
    // Get audit logs
    this.getAuditLogs = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 50,
          action,
          resource,
          userId,
          startDate,
          endDate
        } = req.query;
        const filter = {};
        if (action) filter.action = action;
        if (resource) filter.resource = resource;
        if (userId) filter.userId = userId;
        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate);
          if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [logs, total] = await Promise.all([
          AuditLog_model_default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
          AuditLog_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            logs,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Admin creates book for author
    this.createBookForAuthor = asyncHandler(
      async (req, res, _next) => {
        const {
          authorId,
          bookName,
          subtitle,
          language,
          bookType,
          targetAudience,
          needFormatting,
          needCopyright,
          needDesigning,
          physicalCopies,
          royaltyPercentage,
          expectedLaunchDate,
          marketplaces,
          paymentPlan
        } = req.body;
        if (!authorId || !bookName || !bookType || !expectedLaunchDate) {
          throw new ApiError_default(400, "Author ID, book name, type, and launch date are required");
        }
        const author = await Author_model_default.findOne({ authorId });
        if (!author) throw new ApiError_default(404, "Author not found");
        const user = await User_model_default.findOne({ userId: author.userId });
        if (!user) throw new ApiError_default(404, "User not found");
        const bookLang = language || "English";
        const pricingConfig = await PricingConfig_model_default.findOne({ language: bookLang, isActive: true });
        let priceBreakdown;
        if (pricingConfig) {
          const calc = (p) => ({
            original: p.main,
            discounted: Math.round(p.main - p.main * p.discount / 100)
          });
          const publishing = calc(pricingConfig.publishingPrice);
          const coverDesign = calc(pricingConfig.coverDesignPrice);
          const formatting = needFormatting ? calc(pricingConfig.formattingPrice) : { original: 0, discounted: 0 };
          const copyright = needCopyright ? calc(pricingConfig.copyrightPrice) : { original: 0, discounted: 0 };
          const distribution = calc(pricingConfig.distributionPrice);
          const freeCopies = 2;
          const extraCopies = Math.max(0, (physicalCopies || 2) - freeCopies);
          const physicalCopiesPrice = {
            original: extraCopies * pricingConfig.perBookCopyPrice.main,
            discounted: Math.round(extraCopies * (pricingConfig.perBookCopyPrice.main - pricingConfig.perBookCopyPrice.main * pricingConfig.perBookCopyPrice.discount / 100)),
            quantity: physicalCopies || 2
          };
          const netAmount = publishing.discounted + coverDesign.discounted + formatting.discounted + copyright.discounted + distribution.discounted + physicalCopiesPrice.discounted;
          const totalOriginal = publishing.original + coverDesign.original + formatting.original + copyright.original + distribution.original + physicalCopiesPrice.original;
          priceBreakdown = {
            publishing,
            coverDesign,
            formatting,
            copyright,
            distribution,
            physicalCopies: physicalCopiesPrice,
            netAmount,
            totalDiscount: totalOriginal - netAmount,
            referralDiscount: 0,
            finalAmount: netAmount
          };
        }
        const bookCount = await Book_model_default.countDocuments();
        const bookId = `BK${(bookCount + 1).toString().padStart(5, "0")}`;
        const finalAmount = priceBreakdown?.finalAmount || 0;
        const book = await Book_model_default.create({
          bookId,
          authorId,
          bookName,
          subtitle,
          language: bookLang,
          bookType,
          targetAudience,
          needFormatting: needFormatting || false,
          needCopyright: needCopyright || false,
          needDesigning: needDesigning || false,
          physicalCopies: physicalCopies || 2,
          royaltyPercentage: royaltyPercentage || 70,
          expectedLaunchDate,
          marketplaces: marketplaces || [],
          priceBreakdown: priceBreakdown || {},
          paymentPlan: paymentPlan || "full",
          paymentStatus: {
            totalAmount: finalAmount,
            paidAmount: 0,
            pendingAmount: finalAmount,
            paymentCompletionPercentage: 0,
            installments: finalAmount > 0 ? [{ amount: finalAmount, status: "pending" }] : []
          },
          status: "payment_pending",
          createdBy: req.user?.userId
        });
        author.totalBooks = (author.totalBooks || 0) + 1;
        await author.save();
        try {
          const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
          await EmailService.sendPaymentRequestEmail(
            user.email,
            user.firstName,
            bookName,
            finalAmount,
            `${frontendUrl}/author/books`
          );
        } catch {
        }
        res.status(201).json({
          success: true,
          message: "Book created for author successfully",
          data: { book }
        });
      }
    );
  }
  static {
    // Approve book - move from 'pending' to 'formatting'
    this.approveBook = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        if (book.status !== "pending") {
          throw new ApiError_default(400, "Only pending books can be approved");
        }
        const oldStatus = book.status;
        book.status = "formatting";
        const adminUserId = req.user?.userId || "system";
        book.statusHistory = book.statusHistory || [];
        book.statusHistory.push({
          status: "formatting",
          changedBy: adminUserId,
          changedAt: /* @__PURE__ */ new Date(),
          note: "Book approved by admin"
        });
        await book.save();
        const info = await getAuthorUserInfo(book.authorId);
        if (info) {
          try {
            await EmailService.sendBookApprovalEmail(info.email, info.name, book.bookName, bookId);
          } catch {
          }
        }
        if (adminUserId) {
          await AuditLog_model_default.create({
            userId: adminUserId,
            action: "status_change",
            resource: "Book",
            resourceId: bookId,
            details: {
              adminId: adminUserId,
              oldStatus,
              newStatus: "formatting",
              action: "approve"
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(200).json({
          success: true,
          message: "Book approved and moved to formatting stage",
          data: { book }
        });
      }
    );
  }
  static {
    // Decline book
    this.declineBook = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { reason } = req.body;
        if (!reason) {
          throw new ApiError_default(400, "Rejection reason is required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        if (book.status !== "pending") {
          throw new ApiError_default(400, "Only pending books can be declined");
        }
        const oldStatus = book.status;
        book.status = "rejected";
        book.rejectionReason = reason;
        const adminUserId = req.user?.userId || "system";
        book.statusHistory = book.statusHistory || [];
        book.statusHistory.push({
          status: "rejected",
          changedBy: adminUserId,
          changedAt: /* @__PURE__ */ new Date(),
          note: `Declined: ${reason}`
        });
        await book.save();
        const info = await getAuthorUserInfo(book.authorId);
        if (info) {
          try {
            await EmailService.sendBookDeclineEmail(info.email, info.name, book.bookName, bookId, reason);
          } catch {
          }
        }
        if (adminUserId) {
          await AuditLog_model_default.create({
            userId: adminUserId,
            action: "status_change",
            resource: "Book",
            resourceId: bookId,
            details: {
              adminId: adminUserId,
              oldStatus,
              newStatus: "rejected",
              reason
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(200).json({
          success: true,
          message: "Book declined",
          data: { book }
        });
      }
    );
  }
  static {
    // Update book stage through pipeline: formatting -> designing -> printing -> published
    this.updateBookStage = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const pipeline = {
          formatting: "designing",
          designing: "printing",
          printing: "published"
        };
        const nextStatus = pipeline[book.status];
        if (!nextStatus) {
          throw new ApiError_default(400, `Cannot advance book from '${book.status}' status. Book must be in formatting, designing, or printing stage.`);
        }
        const oldStatus = book.status;
        book.status = nextStatus;
        if (nextStatus === "published") {
          book.actualLaunchDate = /* @__PURE__ */ new Date();
          const author = await Author_model_default.findOne({ authorId: book.authorId });
          if (author) {
            author.totalBooks += 1;
            await author.save();
          }
        }
        const adminUserId = req.user?.userId || "system";
        book.statusHistory = book.statusHistory || [];
        book.statusHistory.push({
          status: nextStatus,
          changedBy: adminUserId,
          changedAt: /* @__PURE__ */ new Date(),
          note: `Stage advanced from ${oldStatus} to ${nextStatus}`
        });
        await book.save();
        const info = await getAuthorUserInfo(book.authorId);
        if (info) {
          try {
            await EmailService.sendBookStatusUpdateEmail(info.email, info.name, book.bookName, bookId, nextStatus);
          } catch {
          }
        }
        if (adminUserId) {
          await AuditLog_model_default.create({
            userId: adminUserId,
            action: "status_change",
            resource: "Book",
            resourceId: bookId,
            details: {
              adminId: adminUserId,
              oldStatus,
              newStatus: nextStatus
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
          });
        }
        res.status(200).json({
          success: true,
          message: `Book moved from ${oldStatus} to ${nextStatus}`,
          data: { book }
        });
      }
    );
  }
  static {
    // Update product links for a book
    this.updateProductLinks = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { platform, productLink, rating } = req.body;
        if (!platform) {
          throw new ApiError_default(400, "Platform is required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const platformData = book.platformWiseSales.get(platform) || { sellingUnits: 0 };
        if (productLink !== void 0) platformData.productLink = productLink;
        if (rating !== void 0) platformData.rating = rating;
        book.platformWiseSales.set(platform, platformData);
        await book.save();
        res.status(200).json({
          success: true,
          message: "Product links updated successfully",
          data: { book }
        });
      }
    );
  }
  static {
    // Create payment request for a book
    this.createPaymentRequest = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { serviceType, amount, description } = req.body;
        if (!serviceType || !amount || !description) {
          throw new ApiError_default(400, "Service type, amount, and description are required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        book.paymentRequests = book.paymentRequests || [];
        book.paymentRequests.push({
          amount,
          serviceType,
          description,
          status: "pending",
          createdAt: /* @__PURE__ */ new Date()
        });
        await book.save();
        const info = await getAuthorUserInfo(book.authorId);
        if (info) {
          try {
            await EmailService.sendPaymentRequestNotification(info.email, info.name, book.bookName, amount, description);
          } catch {
          }
        }
        res.status(201).json({
          success: true,
          message: "Payment request created successfully",
          data: { book }
        });
      }
    );
  }
  static {
    // Extend due date for book payment
    this.extendDueDate = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { newDueDate } = req.body;
        if (!newDueDate) {
          throw new ApiError_default(400, "New due date is required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        book.paymentStatus.dueDate = new Date(newDueDate);
        await book.save();
        res.status(200).json({
          success: true,
          message: "Due date extended successfully",
          data: { book }
        });
      }
    );
  }
  static {
    // ── Sub-admin management (super_admin only) ──
    this.getAllSubAdmins = asyncHandler(
      async (_req, res, _next) => {
        const subAdmins = await User_model_default.find({ role: "sub_admin" }).select(
          "-password -twoFactorSecret -backupCodes"
        );
        res.json({ success: true, data: { subAdmins } });
      }
    );
  }
  static {
    this.createSubAdmin = asyncHandler(
      async (req, res, _next) => {
        const { firstName, lastName, email, password, permissions = [] } = req.body;
        if (!firstName || !lastName || !email || !password) {
          throw new ApiError_default(400, "firstName, lastName, email, and password are required");
        }
        const existing = await User_model_default.findOne({ email: email.toLowerCase().trim() });
        if (existing) throw new ApiError_default(400, "Email already in use");
        const validModules = permissions.filter(
          (p) => MODULES.includes(p)
        );
        const userId = generateUniqueId("ADM");
        const subAdmin = await User_model_default.create({
          userId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          password,
          role: "sub_admin",
          tier: "enterprise",
          isActive: true,
          permissions: validModules
        });
        const result = subAdmin.toObject();
        delete result.password;
        delete result.twoFactorSecret;
        delete result.backupCodes;
        res.status(201).json({ success: true, data: { subAdmin: result } });
      }
    );
  }
  static {
    this.updateSubAdmin = asyncHandler(
      async (req, res, _next) => {
        const { id } = req.params;
        const { firstName, lastName, permissions, isActive, password } = req.body;
        const subAdmin = await User_model_default.findOne({ userId: id, role: "sub_admin" }).select("+password");
        if (!subAdmin) throw new ApiError_default(404, "Sub-admin not found");
        if (firstName !== void 0) subAdmin.firstName = firstName.trim();
        if (lastName !== void 0) subAdmin.lastName = lastName.trim();
        if (isActive !== void 0) subAdmin.isActive = isActive;
        if (permissions !== void 0) {
          subAdmin.permissions = permissions.filter(
            (p) => MODULES.includes(p)
          );
        }
        if (password) subAdmin.password = password;
        await subAdmin.save();
        const result = subAdmin.toObject();
        delete result.password;
        delete result.twoFactorSecret;
        delete result.backupCodes;
        res.json({ success: true, data: { subAdmin: result } });
      }
    );
  }
  static {
    this.deleteSubAdmin = asyncHandler(
      async (req, res, _next) => {
        const { id } = req.params;
        const subAdmin = await User_model_default.findOne({ userId: id, role: "sub_admin" });
        if (!subAdmin) throw new ApiError_default(404, "Sub-admin not found");
        await subAdmin.deleteOne();
        res.json({ success: true, message: "Sub-admin deleted successfully" });
      }
    );
  }
};

// src/services/upload.service.ts
var import_cloudinary2 = require("cloudinary");
var import_fs2 = __toESM(require("fs"));
var UploadService = class _UploadService {
  // Upload file to Cloudinary
  static async uploadToCloudinary(filePath, folder = "povital") {
    try {
      const ext = filePath.split(".").pop()?.toLowerCase() || "";
      const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"];
      const resourceType = imageExts.includes(ext) ? "image" : "raw";
      const uploadOptions = {
        folder,
        resource_type: resourceType,
        access_mode: "public",
        type: "upload"
      };
      if (ext === "pdf") {
        uploadOptions.flags = "attachment";
      }
      const result = await import_cloudinary2.v2.uploader.upload(filePath, uploadOptions);
      import_fs2.default.unlinkSync(filePath);
      logger_default.info(`File uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      logger_default.error("Error uploading to Cloudinary:", error);
      if (import_fs2.default.existsSync(filePath)) {
        import_fs2.default.unlinkSync(filePath);
      }
      throw new Error("Failed to upload file");
    }
  }
  // Upload multiple files
  static async uploadMultipleFiles(filePaths, folder = "povital") {
    const uploadPromises = filePaths.map(
      (filePath) => this.uploadToCloudinary(filePath, folder)
    );
    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      logger_default.error("Error uploading multiple files:", error);
      throw new Error("Failed to upload files");
    }
  }
  // Delete file from Cloudinary
  static async deleteFromCloudinary(publicId) {
    try {
      await import_cloudinary2.v2.uploader.destroy(publicId);
      logger_default.info(`File deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      logger_default.error("Error deleting from Cloudinary:", error);
      throw new Error("Failed to delete file");
    }
  }
  // Get Cloudinary public ID from URL
  static getPublicIdFromUrl(url) {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split(".")[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
  }
  // Extract full public ID (with folder path) from a Cloudinary URL
  // e.g. https://res.cloudinary.com/cloud/raw/upload/v123/povital/books/manuscripts/abc.pdf
  //   => povital/books/manuscripts/abc
  static extractPublicIdFromUrl(url) {
    const resourceType = url.includes("/raw/upload/") ? "raw" : "image";
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) {
      const parts = url.split("/");
      return { publicId: parts[parts.length - 1].split(".")[0], resourceType };
    }
    let afterUpload = url.substring(uploadIndex + "/upload/".length);
    afterUpload = afterUpload.replace(/^v\d+\//, "");
    const lastDot = afterUpload.lastIndexOf(".");
    const publicId = lastDot !== -1 ? afterUpload.substring(0, lastDot) : afterUpload;
    return { publicId, resourceType };
  }
  // Generate a signed delivery URL for a Cloudinary resource.
  // The account has "Delivery URL Security" enabled, so all access requires signed URLs.
  // We use sign_url:true (no expires_at — requires Advanced plan) and preserve the
  // original version number so the signed URL matches the actual CDN resource URL.
  static generateSignedUrl(cloudinaryUrl) {
    const { publicId, resourceType } = _UploadService.extractPublicIdFromUrl(cloudinaryUrl);
    const urlLower = cloudinaryUrl.toLowerCase();
    const ext = urlLower.endsWith(".pdf") ? "pdf" : urlLower.endsWith(".docx") ? "docx" : urlLower.endsWith(".doc") ? "doc" : urlLower.endsWith(".png") ? "png" : urlLower.endsWith(".jpg") || urlLower.endsWith(".jpeg") ? "jpg" : "";
    const publicIdFull = resourceType === "raw" && ext ? `${publicId}.${ext}` : publicId;
    const versionMatch = cloudinaryUrl.match(/\/upload\/(?:s--[^/]+--\/)?v(\d+)\//);
    const version = versionMatch ? parseInt(versionMatch[1]) : void 0;
    const signedUrl = import_cloudinary2.v2.url(publicIdFull, {
      resource_type: resourceType,
      type: "upload",
      sign_url: true,
      secure: true,
      ...version ? { version } : {}
    });
    return signedUrl;
  }
};

// src/controllers/book.controller.ts
var BookController = class _BookController {
  // Helper: Check if user is admin
  static isAdmin(req) {
    return req.user?.role === "super_admin" || req.user?.role === "sub_admin";
  }
  // Helper: Calculate price breakdown from config and selected services
  static calculatePriceBreakdown(config2, options) {
    const calc = (p) => ({
      original: p.main,
      discounted: Math.round(p.main - p.main * p.discount / 100)
    });
    const publishing = calc(config2.publishingPrice);
    const coverDesign = options.hasCover ? calc(config2.coverDesignPrice) : { original: 0, discounted: 0 };
    const formatting = options.needFormatting ? calc(config2.formattingPrice) : { original: 0, discounted: 0 };
    const copyright = options.needCopyright ? calc(config2.copyrightPrice) : { original: 0, discounted: 0 };
    const distribution = calc(config2.distributionPrice);
    const freeCopies = 2;
    const extraCopies = Math.max(0, options.physicalCopies - freeCopies);
    const physicalCopiesPrice = {
      original: extraCopies * config2.perBookCopyPrice.main,
      discounted: Math.round(extraCopies * (config2.perBookCopyPrice.main - config2.perBookCopyPrice.main * config2.perBookCopyPrice.discount / 100)),
      quantity: options.physicalCopies
    };
    const netAmount = publishing.discounted + coverDesign.discounted + formatting.discounted + copyright.discounted + distribution.discounted + physicalCopiesPrice.discounted;
    const totalOriginal = publishing.original + coverDesign.original + formatting.original + copyright.original + distribution.original + physicalCopiesPrice.original;
    const totalDiscount = totalOriginal - netAmount;
    const referralDiscount = options.referralDiscount || 0;
    const finalAmount = Math.max(0, netAmount - referralDiscount);
    return {
      publishing,
      coverDesign,
      formatting,
      copyright,
      distribution,
      physicalCopies: physicalCopiesPrice,
      netAmount,
      totalDiscount,
      referralDiscount,
      finalAmount
    };
  }
  static {
    // Create a new book (author)
    this.createBook = asyncHandler(
      async (req, res, _next) => {
        const {
          bookName,
          subtitle,
          language,
          bookType,
          targetAudience,
          needFormatting,
          needCopyright,
          needDesigning,
          physicalCopies,
          royaltyPercentage,
          expectedLaunchDate,
          marketplaces,
          paymentPlan,
          hasCover
        } = req.body;
        if (!bookName || !bookType || !expectedLaunchDate) {
          throw new ApiError_default(400, "Book name, type, and expected launch date are required");
        }
        const userId = req.user?.userId;
        if (!userId) throw new ApiError_default(401, "Unauthorized");
        const author = await Author_model_default.findOne({ userId });
        if (!author) throw new ApiError_default(404, "Author profile not found");
        if (author.isRestricted) {
          throw new ApiError_default(403, `Account restricted: ${author.restrictionReason || "Contact support"}`);
        }
        const bookLang = language || "English";
        const pricingConfig = await PricingConfig_model_default.findOne({ language: bookLang, isActive: true });
        let priceBreakdown;
        if (pricingConfig) {
          priceBreakdown = _BookController.calculatePriceBreakdown(pricingConfig, {
            needFormatting: needFormatting || false,
            needCopyright: needCopyright || false,
            needDesigning: needDesigning || false,
            physicalCopies: physicalCopies || 2,
            hasCover: hasCover !== false
          });
        }
        const bookCount = await Book_model_default.countDocuments();
        const bookId = `BK${(bookCount + 1).toString().padStart(5, "0")}`;
        const finalAmount = priceBreakdown?.finalAmount || 0;
        const plan = paymentPlan || "full";
        let installments = [];
        if (finalAmount > 0) {
          switch (plan) {
            case "2_installments":
              installments = [
                { amount: Math.ceil(finalAmount * 0.5), status: "pending" },
                { amount: Math.floor(finalAmount * 0.5), status: "pending" }
              ];
              break;
            case "3_installments":
              installments = [
                { amount: Math.ceil(finalAmount * 0.25), status: "pending" },
                { amount: Math.ceil(finalAmount * 0.5), status: "pending" },
                { amount: Math.floor(finalAmount * 0.25), status: "pending" }
              ];
              break;
            case "4_installments":
              installments = [
                { amount: Math.ceil(finalAmount * 0.25), status: "pending" },
                { amount: Math.ceil(finalAmount * 0.5), status: "pending" },
                { amount: Math.floor(finalAmount * 0.25), status: "pending" },
                { amount: 0, status: "pending" }
              ];
              break;
            case "pay_later":
              installments = [{ amount: finalAmount, status: "pending" }];
              break;
            default:
              installments = [{ amount: finalAmount, status: "pending" }];
          }
        }
        const dueDate = plan === "pay_later" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3) : void 0;
        const book = await Book_model_default.create({
          bookId,
          authorId: author.authorId,
          bookName,
          subtitle,
          language: bookLang,
          bookType,
          targetAudience,
          needFormatting: needFormatting || false,
          needCopyright: needCopyright || false,
          needDesigning: needDesigning || false,
          physicalCopies: physicalCopies || 2,
          royaltyPercentage: royaltyPercentage || 70,
          expectedLaunchDate,
          marketplaces: marketplaces || [],
          priceBreakdown: priceBreakdown || {},
          paymentPlan: plan,
          paymentStatus: {
            totalAmount: finalAmount,
            paidAmount: 0,
            pendingAmount: finalAmount,
            paymentCompletionPercentage: 0,
            dueDate,
            installments
          },
          status: finalAmount > 0 ? "payment_pending" : "pending"
        });
        author.totalBooks = (author.totalBooks || 0) + 1;
        await author.save();
        res.status(201).json({
          success: true,
          message: "Book created successfully",
          data: { book }
        });
      }
    );
  }
  static {
    // Get book by ID
    this.getBookById = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (req.user?.role === "author") {
          const author = await Author_model_default.findOne({ userId });
          if (!author || book.authorId !== author.authorId) {
            throw new ApiError_default(403, "Access denied");
          }
        }
        res.status(200).json({
          success: true,
          data: { book }
        });
      }
    );
  }
  static {
    // Update book details
    this.updateBook = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const updates = req.body;
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author || book.authorId !== author.authorId) {
          throw new ApiError_default(403, "Access denied");
        }
        if (!["draft", "rejected"].includes(book.status)) {
          throw new ApiError_default(
            400,
            "Cannot update book. Only draft or rejected books can be edited."
          );
        }
        const allowedUpdates = [
          "bookName",
          "subtitle",
          "language",
          "bookType",
          "targetAudience",
          "needFormatting",
          "needCopyright",
          "needDesigning",
          "physicalCopies",
          "expectedLaunchDate",
          "marketplaces"
        ];
        allowedUpdates.forEach((field) => {
          if (updates[field] !== void 0) {
            book[field] = updates[field];
          }
        });
        await book.save();
        res.status(200).json({
          success: true,
          message: "Book updated successfully",
          data: { book }
        });
      }
    );
  }
  static {
    // Upload cover page
    this.uploadCoverPage = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        if (!req.file) {
          throw new ApiError_default(400, "Cover page image is required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        if (!_BookController.isAdmin(req)) {
          const userId = req.user?.userId;
          if (!userId) throw new ApiError_default(401, "Unauthorized");
          const author = await Author_model_default.findOne({ userId });
          if (!author || book.authorId !== author.authorId) throw new ApiError_default(403, "Access denied");
        }
        const url = await UploadService.uploadToCloudinary(
          req.file.path,
          "povital/books/covers"
        );
        if (book.coverPage) {
          const publicId = UploadService.getPublicIdFromUrl(book.coverPage);
          await UploadService.deleteFromCloudinary(publicId);
        }
        book.coverPage = url;
        await book.save();
        res.status(200).json({
          success: true,
          message: "Cover page uploaded successfully",
          data: { coverPage: url }
        });
      }
    );
  }
  static {
    // Upload book files (manuscript, etc.)
    this.uploadBookFiles = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        if (!req.files || req.files.length === 0) {
          throw new ApiError_default(400, "Book files are required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        if (!_BookController.isAdmin(req)) {
          const userId = req.user?.userId;
          if (!userId) throw new ApiError_default(401, "Unauthorized");
          const author = await Author_model_default.findOne({ userId });
          if (!author || book.authorId !== author.authorId) throw new ApiError_default(403, "Access denied");
        }
        const files = req.files;
        const filePaths = files.map((file) => file.path);
        const urls = await UploadService.uploadMultipleFiles(
          filePaths,
          "povital/books/manuscripts"
        );
        book.uploadedFiles = [...book.uploadedFiles, ...urls];
        await book.save();
        res.status(200).json({
          success: true,
          message: "Book files uploaded successfully",
          data: { uploadedFiles: book.uploadedFiles }
        });
      }
    );
  }
  static {
    // Delete uploaded file
    this.deleteBookFile = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { fileUrl } = req.body;
        if (!fileUrl) {
          throw new ApiError_default(400, "File URL is required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        if (!_BookController.isAdmin(req)) {
          const userId = req.user?.userId;
          if (!userId) throw new ApiError_default(401, "Unauthorized");
          const author = await Author_model_default.findOne({ userId });
          if (!author || book.authorId !== author.authorId) throw new ApiError_default(403, "Access denied");
        }
        if (!book.uploadedFiles.includes(fileUrl)) {
          throw new ApiError_default(404, "File not found in book");
        }
        const publicId = UploadService.getPublicIdFromUrl(fileUrl);
        await UploadService.deleteFromCloudinary(publicId);
        book.uploadedFiles = book.uploadedFiles.filter((url) => url !== fileUrl);
        await book.save();
        res.status(200).json({
          success: true,
          message: "File deleted successfully",
          data: { uploadedFiles: book.uploadedFiles }
        });
      }
    );
  }
  static {
    // Submit book for review
    this.submitForReview = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author || book.authorId !== author.authorId) {
          throw new ApiError_default(403, "Access denied");
        }
        if (!book.coverPage) {
          throw new ApiError_default(400, "Cover page is required");
        }
        if (book.uploadedFiles.length === 0) {
          throw new ApiError_default(400, "At least one book file is required");
        }
        if (book.status !== "draft" && book.status !== "rejected") {
          throw new ApiError_default(400, "Book is already submitted or published");
        }
        book.status = "pending";
        book.rejectionReason = void 0;
        await book.save();
        res.status(200).json({
          success: true,
          message: "Book submitted for review successfully",
          data: { book }
        });
      }
    );
  }
  static {
    // Delete book (only drafts)
    this.deleteBook = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author || book.authorId !== author.authorId) {
          throw new ApiError_default(403, "Access denied");
        }
        if (book.status !== "draft") {
          throw new ApiError_default(400, "Only draft books can be deleted");
        }
        if (book.coverPage) {
          const publicId = UploadService.getPublicIdFromUrl(book.coverPage);
          await UploadService.deleteFromCloudinary(publicId);
        }
        for (const fileUrl of book.uploadedFiles) {
          const publicId = UploadService.getPublicIdFromUrl(fileUrl);
          await UploadService.deleteFromCloudinary(publicId);
        }
        await Book_model_default.deleteOne({ bookId });
        res.status(200).json({
          success: true,
          message: "Book deleted successfully"
        });
      }
    );
  }
  static {
    // Get pricing for a language (used by book form)
    this.getPricingSuggestions = asyncHandler(
      async (req, res, _next) => {
        const { language } = req.query;
        if (!language) {
          throw new ApiError_default(400, "Language is required");
        }
        const config2 = await PricingConfig_model_default.findOne({ language, isActive: true });
        if (!config2) {
          res.status(200).json({
            success: true,
            message: "No pricing configuration found for this language",
            data: { config: null }
          });
          return;
        }
        res.status(200).json({
          success: true,
          data: { config: config2 }
        });
      }
    );
  }
  static {
    // Generate a signed URL for a book file (PDF access bypass for Cloudinary restrictions)
    this.getFileUrl = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { fileUrl } = req.query;
        if (!fileUrl || typeof fileUrl !== "string") {
          throw new ApiError_default(400, "fileUrl query parameter is required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) throw new ApiError_default(404, "Book not found");
        const userId = req.user?.userId;
        if (!userId) throw new ApiError_default(401, "Unauthorized");
        if (req.user?.role === "author") {
          const author = await Author_model_default.findOne({ userId });
          if (!author || book.authorId !== author.authorId) {
            throw new ApiError_default(403, "Access denied");
          }
        }
        const isBookFile = book.uploadedFiles.includes(fileUrl) || book.coverPage === fileUrl;
        if (!isBookFile) {
          throw new ApiError_default(403, "File does not belong to this book");
        }
        const signedUrl = UploadService.generateSignedUrl(fileUrl);
        res.status(200).json({
          success: true,
          data: { url: signedUrl }
        });
      }
    );
  }
  static {
    // Update book sales data (admin only - called from admin routes)
    this.updateSalesData = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.params;
        const { platform, sellingUnits, productLink, rating } = req.body;
        if (!platform || sellingUnits === void 0) {
          throw new ApiError_default(400, "Platform and selling units are required");
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const platformData = book.platformWiseSales.get(platform) || {
          sellingUnits: 0
        };
        platformData.sellingUnits += sellingUnits;
        if (productLink) platformData.productLink = productLink;
        if (rating) platformData.rating = rating;
        book.platformWiseSales.set(platform, platformData);
        book.totalSellingUnits += sellingUnits;
        await book.save();
        const author = await Author_model_default.findOne({ authorId: book.authorId });
        if (author) {
          author.totalSoldUnits += sellingUnits;
          await author.save();
        }
        res.status(200).json({
          success: true,
          message: "Sales data updated successfully",
          data: { book }
        });
      }
    );
  }
};

// src/middlewares/role.middleware.ts
var checkRole = (...roles) => {
  return (req, _res, next) => {
    try {
      if (!req.user) {
        throw new ApiError_default(401, "Authentication required");
      }
      if (!roles.includes(req.user.role)) {
        throw new ApiError_default(403, "Access denied. Insufficient permissions.");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var checkPermission = (...permissions) => {
  return (req, _res, next) => {
    try {
      if (!req.user) {
        throw new ApiError_default(401, "Authentication required");
      }
      if (req.user.role === "super_admin") {
        return next();
      }
      const userPermissions = req.user.permissions || [];
      const hasPermission = permissions.some(
        (permission) => userPermissions.includes(permission)
      );
      if (!hasPermission) {
        throw new ApiError_default(403, "You do not have permission to perform this action.");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/routes/admin.routes.ts
var router4 = (0, import_express4.Router)();
router4.use(verifyToken);
router4.use(checkRole("super_admin", "sub_admin"));
router4.get("/sub-admins", checkRole("super_admin"), AdminController.getAllSubAdmins);
router4.post("/sub-admins", checkRole("super_admin"), AdminController.createSubAdmin);
router4.put("/sub-admins/:id", checkRole("super_admin"), AdminController.updateSubAdmin);
router4.delete("/sub-admins/:id", checkRole("super_admin"), AdminController.deleteSubAdmin);
router4.post("/authors", checkPermission("authors"), AdminController.createAuthor);
router4.get("/authors", checkPermission("authors"), AdminController.getAllAuthors);
router4.get("/authors/:authorId", checkPermission("authors"), AdminController.getAuthorDetails);
router4.get("/authors/:authorId/bank-accounts", checkPermission("authors"), AdminController.getAuthorBankAccounts);
router4.put("/authors/:authorId/tier", checkPermission("authors"), AdminController.updateAuthorTier);
router4.put("/authors/:authorId/restrict", checkPermission("authors"), AdminController.restrictAuthor);
router4.post("/books", checkPermission("books"), AdminController.createBookForAuthor);
router4.get("/books", checkPermission("books"), AdminController.getAllBooks);
router4.get("/books/:bookId", checkPermission("books"), BookController.getBookById);
router4.put("/books/:bookId/status", checkPermission("books"), AdminController.updateBookStatus);
router4.put("/books/:bookId/approve", checkPermission("books"), AdminController.approveBook);
router4.put("/books/:bookId/decline", checkPermission("books"), AdminController.declineBook);
router4.put("/books/:bookId/stage", checkPermission("books"), AdminController.updateBookStage);
router4.put("/books/:bookId/product-links", checkPermission("books"), AdminController.updateProductLinks);
router4.post("/books/:bookId/payment-request", checkPermission("payments"), AdminController.createPaymentRequest);
router4.put("/books/:bookId/extend-due-date", checkPermission("payments"), AdminController.extendDueDate);
router4.get("/tickets", checkPermission("support"), AdminController.getAllTickets);
router4.get("/stats", AdminController.getPlatformStats);
router4.put("/pricing", checkPermission("payments"), AdminController.updatePricingConfig);
router4.get("/audit-logs", checkPermission("analytics"), AdminController.getAuditLogs);
var admin_routes_default = router4;

// src/routes/author.routes.ts
var import_express5 = require("express");

// src/controllers/author.controller.ts
var import_crypto3 = __toESM(require("crypto"));
var AuthorController = class {
  static {
    // Get author profile
    this.getProfile = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const user = await User_model_default.findOne({ userId });
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        res.status(200).json({
          success: true,
          data: {
            user,
            author
          }
        });
      }
    );
  }
  static {
    // Update author profile
    this.updateProfile = asyncHandler(
      async (req, res, _next) => {
        const {
          publishedArticles,
          address
        } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        if (publishedArticles !== void 0) author.publishedArticles = publishedArticles;
        if (address) {
          author.address = {
            ...author.address,
            ...address
          };
        }
        await author.save();
        res.status(200).json({
          success: true,
          message: "Profile updated successfully",
          data: { author }
        });
      }
    );
  }
  static {
    // Upload profile picture
    this.uploadProfilePicture = asyncHandler(
      async (req, res, _next) => {
        if (!req.file) {
          throw new ApiError_default(400, "Profile picture is required");
        }
        const url = await UploadService.uploadToCloudinary(
          req.file.path,
          "povital/authors/profiles"
        );
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        if (author.profilePicture) {
          const publicId = UploadService.getPublicIdFromUrl(author.profilePicture);
          await UploadService.deleteFromCloudinary(publicId);
        }
        author.profilePicture = url;
        await author.save();
        res.status(200).json({
          success: true,
          message: "Profile picture uploaded successfully",
          data: { profilePicture: url }
        });
      }
    );
  }
  static {
    // Get author dashboard statistics
    this.getDashboard = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const [
          totalBooks,
          publishedBooks,
          pendingBooks,
          totalEarnings,
          pendingPayments,
          recentTransactions,
          topSellingBook
        ] = await Promise.all([
          Book_model_default.countDocuments({ authorId: author.authorId }),
          Book_model_default.countDocuments({ authorId: author.authorId, status: "published" }),
          Book_model_default.countDocuments({ authorId: author.authorId, status: "pending" }),
          Transaction_model_default.aggregate([
            {
              $match: {
                authorId: author.authorId,
                status: "completed",
                type: "royalty_payment"
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.aggregate([
            {
              $match: {
                authorId: author.authorId,
                status: "pending",
                type: "royalty_payment"
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.find({ authorId: author.authorId }).sort({ createdAt: -1 }).limit(5),
          Book_model_default.findOne({ authorId: author.authorId, status: "published" }).sort({
            totalSellingUnits: -1
          })
        ]);
        res.status(200).json({
          success: true,
          data: {
            overview: {
              totalBooks,
              publishedBooks,
              pendingBooks,
              totalEarnings: totalEarnings[0]?.total || 0,
              pendingPayments: pendingPayments[0]?.total || 0,
              totalSoldUnits: author.totalSoldUnits
            },
            recentTransactions,
            topSellingBook
          }
        });
      }
    );
  }
  static {
    // Get all books by author
    this.getMyBooks = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 10,
          status,
          search,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const filter = { authorId: author.authorId };
        if (status) {
          filter.status = status;
        }
        if (search) {
          filter.bookName = new RegExp(search, "i");
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const [books, total] = await Promise.all([
          Book_model_default.find(filter).sort(sort).skip(skip).limit(Number(limit)),
          Book_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            books,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Get transactions
    this.getTransactions = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          type,
          status,
          startDate,
          endDate
        } = req.query;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const filter = { authorId: author.authorId };
        if (type) {
          filter.type = type;
        }
        if (status) {
          filter.status = status;
        }
        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate);
          if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [transactions, total] = await Promise.all([
          Transaction_model_default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
          Transaction_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            transactions,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Add bank account
    this.addBankAccount = asyncHandler(
      async (req, res, _next) => {
        const {
          bankName,
          accountHolderName,
          accountNumber,
          ifscCode,
          branchName,
          accountType
        } = req.body;
        if (!bankName || !accountHolderName || !accountNumber || !ifscCode || !branchName) {
          throw new ApiError_default(400, "All bank details are required");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        if (accountType === "primary") {
          const existingPrimary = await BankAccount_model_default.findOne({
            authorId: author.authorId,
            accountType: "primary"
          });
          if (existingPrimary) {
            existingPrimary.accountType = "secondary";
            await existingPrimary.save();
          }
        }
        const rawKey = (process.env.ENCRYPTION_KEY || "default_encryption_key_32_chars!!").slice(0, 32).padEnd(32, "0");
        const key = Buffer.from(rawKey, "utf8");
        const iv = import_crypto3.default.randomBytes(16);
        const cipher = import_crypto3.default.createCipheriv("aes-256-cbc", key, iv);
        let encryptedAccountNumber = iv.toString("hex") + ":" + cipher.update(accountNumber, "utf8", "hex") + cipher.final("hex");
        const bankAccount = await BankAccount_model_default.create({
          authorId: author.authorId,
          bankName,
          accountHolderName,
          accountNumber: accountNumber.slice(-4),
          // Store only last 4 digits
          accountNumberEncrypted: encryptedAccountNumber,
          ifscCode: ifscCode.toUpperCase(),
          branchName,
          accountType: accountType || "secondary"
        });
        res.status(201).json({
          success: true,
          message: "Bank account added successfully",
          data: { bankAccount }
        });
      }
    );
  }
  static {
    // Get all bank accounts
    this.getBankAccounts = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const bankAccounts = await BankAccount_model_default.find({
          authorId: author.authorId,
          isActive: true
        });
        res.status(200).json({
          success: true,
          data: { bankAccounts }
        });
      }
    );
  }
  static {
    // Delete bank account
    this.deleteBankAccount = asyncHandler(
      async (req, res, _next) => {
        const { accountId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const bankAccount = await BankAccount_model_default.findOne({
          _id: accountId,
          authorId: author.authorId
        });
        if (!bankAccount) {
          throw new ApiError_default(404, "Bank account not found");
        }
        bankAccount.isActive = false;
        await bankAccount.save();
        res.status(200).json({
          success: true,
          message: "Bank account deleted successfully"
        });
      }
    );
  }
  static {
    // Edit bank account
    this.editBankAccount = asyncHandler(
      async (req, res, _next) => {
        const { accountId } = req.params;
        const { bankName, accountHolderName, ifscCode, branchName, accountType } = req.body;
        const userId = req.user?.userId;
        if (!userId) throw new ApiError_default(401, "Unauthorized");
        const author = await Author_model_default.findOne({ userId });
        if (!author) throw new ApiError_default(404, "Author profile not found");
        const bankAccount = await BankAccount_model_default.findOne({ _id: accountId, authorId: author.authorId, isActive: true });
        if (!bankAccount) throw new ApiError_default(404, "Bank account not found");
        if (accountType === "primary" && bankAccount.accountType !== "primary") {
          await BankAccount_model_default.updateMany(
            { authorId: author.authorId, accountType: "primary" },
            { accountType: "secondary" }
          );
        }
        if (bankName) bankAccount.bankName = bankName;
        if (accountHolderName) bankAccount.accountHolderName = accountHolderName;
        if (ifscCode) bankAccount.ifscCode = ifscCode.toUpperCase();
        if (branchName) bankAccount.branchName = branchName;
        if (accountType) bankAccount.accountType = accountType;
        await bankAccount.save();
        res.status(200).json({
          success: true,
          message: "Bank account updated successfully",
          data: { bankAccount }
        });
      }
    );
  }
  static {
    // Get referrals
    this.getReferrals = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const [referrals, totalEarnings] = await Promise.all([
          Referral_model_default.find({ referrerId: author.authorId }).sort({ createdAt: -1 }),
          Referral_model_default.aggregate([
            { $match: { referrerId: author.authorId, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
          ])
        ]);
        res.status(200).json({
          success: true,
          data: {
            referralCode: author.referralCode,
            totalReferrals: referrals.length,
            totalEarnings: totalEarnings[0]?.total || 0,
            referrals
          }
        });
      }
    );
  }
  static {
    // Apply referral balance to a book's pending payment
    this.applyReferralBalance = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.body;
        if (!bookId) {
          throw new ApiError_default(400, "Book ID is required");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const book = await Book_model_default.findOne({ bookId, authorId: author.authorId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        if (book.paymentStatus.pendingAmount <= 0) {
          throw new ApiError_default(400, "No pending payment on this book");
        }
        const referrals = await Referral_model_default.find({ referrerId: author.authorId, isActive: true });
        const totalAvailable = referrals.reduce((sum, r) => sum + r.availableBalance, 0);
        if (totalAvailable <= 0) {
          throw new ApiError_default(400, "No referral balance available");
        }
        const deduction = Math.min(totalAvailable, book.paymentStatus.pendingAmount);
        let remaining = deduction;
        for (const referral of referrals) {
          if (remaining <= 0) break;
          const deductFromThis = Math.min(referral.availableBalance, remaining);
          referral.availableBalance -= deductFromThis;
          referral.utilizedBalance += deductFromThis;
          remaining -= deductFromThis;
          await referral.save();
        }
        book.paymentStatus.paidAmount += deduction;
        book.paymentStatus.pendingAmount -= deduction;
        book.paymentStatus.paymentCompletionPercentage = book.paymentStatus.totalAmount > 0 ? Math.round(book.paymentStatus.paidAmount / book.paymentStatus.totalAmount * 100) : 0;
        book.priceBreakdown.referralDiscount = (book.priceBreakdown.referralDiscount || 0) + deduction;
        book.priceBreakdown.finalAmount = Math.max(0, book.priceBreakdown.finalAmount - deduction);
        await book.save();
        res.status(200).json({
          success: true,
          message: `Referral balance of ${deduction} applied successfully`,
          data: {
            appliedAmount: deduction,
            remainingReferralBalance: totalAvailable - deduction,
            bookPaymentStatus: book.paymentStatus
          }
        });
      }
    );
  }
  static {
    // Get sales analytics
    this.getSalesAnalytics = asyncHandler(
      async (req, res, _next) => {
        const { startDate, endDate } = req.query;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);
        const monthlySales = await Book_model_default.aggregate([
          { $match: { authorId: author.authorId, status: "published" } },
          {
            $group: {
              _id: null,
              totalUnits: { $sum: "$totalSellingUnits" },
              totalRevenue: { $sum: "$totalRevenue" }
            }
          }
        ]);
        const books = await Book_model_default.find({
          authorId: author.authorId,
          status: "published"
        });
        const platformWiseSales = {};
        books.forEach((book) => {
          book.platformWiseSales.forEach((value, key) => {
            if (!platformWiseSales[key]) {
              platformWiseSales[key] = {
                sellingUnits: 0,
                count: 0
              };
            }
            platformWiseSales[key].sellingUnits += value.sellingUnits;
            platformWiseSales[key].count += 1;
          });
        });
        const bookTypeDistribution = await Book_model_default.aggregate([
          { $match: { authorId: author.authorId, status: "published" } },
          { $group: { _id: "$bookType", count: { $sum: 1 } } }
        ]);
        res.status(200).json({
          success: true,
          data: {
            overview: {
              totalUnits: monthlySales[0]?.totalUnits || 0,
              totalRevenue: monthlySales[0]?.totalRevenue || 0
            },
            platformWiseSales,
            bookTypeDistribution
          }
        });
      }
    );
  }
};

// src/middlewares/upload.middleware.ts
var import_multer = __toESM(require("multer"));
var import_path4 = __toESM(require("path"));
var import_os = __toESM(require("os"));
var import_fs3 = __toESM(require("fs"));
var uploadDir = process.env.VERCEL ? import_path4.default.join(import_os.default.tmpdir(), "uploads") : import_path4.default.join(__dirname, "../../uploads");
if (!import_fs3.default.existsSync(uploadDir)) {
  import_fs3.default.mkdirSync(uploadDir, { recursive: true });
}
var storage = import_multer.default.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = import_path4.default.extname(file.originalname);
    const basename = import_path4.default.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (_req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const documentTypes = /pdf|doc|docx|txt|rtf/;
  const extname = import_path4.default.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  if (file.fieldname === "profilePicture" || file.fieldname === "coverPage") {
    if (imageTypes.test(extname.replace(".", "")) && mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(
        new ApiError_default(
          400,
          "Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed for profile pictures and cover pages"
        )
      );
    }
  } else if (file.fieldname === "bookFiles") {
    if (documentTypes.test(extname.replace(".", "")) && (mimetype.startsWith("application/") || mimetype.startsWith("text/"))) {
      cb(null, true);
    } else {
      cb(
        new ApiError_default(
          400,
          "Only document files (PDF, DOC, DOCX, TXT, RTF) are allowed for book files"
        )
      );
    }
  } else {
    if (imageTypes.test(extname.replace(".", "")) && mimetype.startsWith("image/") || documentTypes.test(extname.replace(".", "")) && (mimetype.startsWith("application/") || mimetype.startsWith("text/"))) {
      cb(null, true);
    } else {
      cb(new ApiError_default(400, "File type not allowed"));
    }
  }
};
var upload = (0, import_multer.default)({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB max file size
  }
});
var uploadSingle = (fieldName) => upload.single(fieldName);
var uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);

// src/validators/author.validator.ts
var import_joi4 = __toESM(require("joi"));
var authorValidation = {
  updateProfile: import_joi4.default.object({
    publishedArticles: import_joi4.default.array().items(import_joi4.default.object({
      bookName: import_joi4.default.string().max(200).required(),
      isbn: import_joi4.default.string().max(50).optional().allow(""),
      bookPhoto: import_joi4.default.string().optional().allow(""),
      links: import_joi4.default.array().items(import_joi4.default.object({
        platform: import_joi4.default.string().max(100).required(),
        url: import_joi4.default.string().max(500).required()
      })).optional()
    })).optional(),
    address: import_joi4.default.object({
      pinCode: import_joi4.default.string().pattern(/^[0-9]{6}$/).optional().messages({
        "string.pattern.base": "Pin code must be 6 digits"
      }),
      city: import_joi4.default.string().max(50).optional().messages({
        "string.max": "City name cannot exceed 50 characters"
      }),
      district: import_joi4.default.string().max(50).optional().messages({
        "string.max": "District name cannot exceed 50 characters"
      }),
      state: import_joi4.default.string().max(50).optional().messages({
        "string.max": "State name cannot exceed 50 characters"
      }),
      country: import_joi4.default.string().max(50).optional().messages({
        "string.max": "Country name cannot exceed 50 characters"
      }),
      housePlot: import_joi4.default.string().max(200).optional().allow("").messages({
        "string.max": "House/Plot cannot exceed 200 characters"
      }),
      landmark: import_joi4.default.string().max(100).optional().allow("").messages({
        "string.max": "Landmark cannot exceed 100 characters"
      })
    }).optional()
  }),
  addBankAccount: import_joi4.default.object({
    bankName: import_joi4.default.string().min(2).max(100).required().messages({
      "string.min": "Bank name must be at least 2 characters",
      "string.max": "Bank name cannot exceed 100 characters",
      "any.required": "Bank name is required"
    }),
    accountHolderName: import_joi4.default.string().min(2).max(100).required().messages({
      "string.min": "Account holder name must be at least 2 characters",
      "string.max": "Account holder name cannot exceed 100 characters",
      "any.required": "Account holder name is required"
    }),
    accountNumber: import_joi4.default.string().min(9).max(18).pattern(/^[0-9]+$/).required().messages({
      "string.min": "Account number must be at least 9 digits",
      "string.max": "Account number cannot exceed 18 digits",
      "string.pattern.base": "Account number must contain only numbers",
      "any.required": "Account number is required"
    }),
    ifscCode: import_joi4.default.string().length(11).pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).uppercase().required().messages({
      "string.length": "IFSC code must be 11 characters",
      "string.pattern.base": "Invalid IFSC code format",
      "any.required": "IFSC code is required"
    }),
    branchName: import_joi4.default.string().min(2).max(100).required().messages({
      "string.min": "Branch name must be at least 2 characters",
      "string.max": "Branch name cannot exceed 100 characters",
      "any.required": "Branch name is required"
    }),
    accountType: import_joi4.default.string().valid("primary", "secondary").optional().messages({
      "any.only": "Account type must be either primary or secondary"
    })
  })
};

// src/routes/author.routes.ts
var router5 = (0, import_express5.Router)();
router5.use(verifyToken);
router5.use(checkRole("author"));
router5.get("/profile", AuthorController.getProfile);
router5.put("/profile", validate(authorValidation.updateProfile), AuthorController.updateProfile);
router5.post("/profile/picture", uploadSingle("profilePicture"), AuthorController.uploadProfilePicture);
router5.get("/dashboard", AuthorController.getDashboard);
router5.get("/books", AuthorController.getMyBooks);
router5.get("/transactions", AuthorController.getTransactions);
router5.post("/bank-accounts", validate(authorValidation.addBankAccount), AuthorController.addBankAccount);
router5.get("/bank-accounts", AuthorController.getBankAccounts);
router5.put("/bank-accounts/:accountId", AuthorController.editBankAccount);
router5.delete("/bank-accounts/:accountId", AuthorController.deleteBankAccount);
router5.get("/referrals", AuthorController.getReferrals);
router5.post("/referral/apply", AuthorController.applyReferralBalance);
router5.get("/analytics/sales", AuthorController.getSalesAnalytics);
var author_routes_default = router5;

// src/routes/book.routes.ts
var import_express6 = require("express");

// src/validators/book.validator.ts
var import_joi5 = __toESM(require("joi"));
var bookValidation = {
  createBook: import_joi5.default.object({
    bookName: import_joi5.default.string().min(2).max(200).required().messages({
      "string.min": "Book name must be at least 2 characters",
      "string.max": "Book name cannot exceed 200 characters",
      "any.required": "Book name is required"
    }),
    subtitle: import_joi5.default.string().max(300).optional().allow(""),
    language: import_joi5.default.string().max(50).optional(),
    bookType: import_joi5.default.string().min(1).max(100).required().messages({
      "any.required": "Book type is required"
    }),
    targetAudience: import_joi5.default.string().max(200).optional().allow(""),
    needFormatting: import_joi5.default.boolean().optional(),
    needCopyright: import_joi5.default.boolean().optional(),
    needDesigning: import_joi5.default.boolean().optional(),
    physicalCopies: import_joi5.default.number().integer().min(2).optional().messages({
      "number.min": "Minimum 2 physical copies required",
      "number.integer": "Physical copies must be a whole number"
    }),
    royaltyPercentage: import_joi5.default.number().min(0).max(100).optional(),
    expectedLaunchDate: import_joi5.default.date().min("now").required().messages({
      "date.min": "Expected launch date must be in the future",
      "any.required": "Expected launch date is required"
    }),
    marketplaces: import_joi5.default.array().items(import_joi5.default.string()).optional(),
    paymentPlan: import_joi5.default.string().valid("full", "2_installments", "3_installments", "4_installments", "pay_later").optional(),
    hasCover: import_joi5.default.boolean().optional()
  }),
  updateBook: import_joi5.default.object({
    bookName: import_joi5.default.string().min(2).max(200).optional(),
    subtitle: import_joi5.default.string().max(300).optional().allow(""),
    language: import_joi5.default.string().max(50).optional(),
    bookType: import_joi5.default.string().min(1).max(100).optional(),
    targetAudience: import_joi5.default.string().max(200).optional().allow(""),
    needFormatting: import_joi5.default.boolean().optional(),
    needCopyright: import_joi5.default.boolean().optional(),
    needDesigning: import_joi5.default.boolean().optional(),
    physicalCopies: import_joi5.default.number().integer().min(2).optional(),
    expectedLaunchDate: import_joi5.default.date().optional(),
    marketplaces: import_joi5.default.array().items(import_joi5.default.string()).optional()
  })
};

// src/routes/book.routes.ts
var router6 = (0, import_express6.Router)();
router6.use(verifyToken);
router6.get("/pricing-suggestions", BookController.getPricingSuggestions);
router6.get("/:bookId/file-url", BookController.getFileUrl);
router6.post("/", checkRole("author"), validate(bookValidation.createBook), BookController.createBook);
router6.get("/:bookId", BookController.getBookById);
router6.put("/:bookId", checkRole("author"), validate(bookValidation.updateBook), BookController.updateBook);
router6.post("/:bookId/cover", checkRole("author", "super_admin", "sub_admin"), uploadSingle("coverPage"), BookController.uploadCoverPage);
router6.post("/:bookId/files", checkRole("author", "super_admin", "sub_admin"), uploadMultiple("bookFiles", 5), BookController.uploadBookFiles);
router6.delete("/:bookId/files", checkRole("author", "super_admin", "sub_admin"), BookController.deleteBookFile);
router6.post("/:bookId/submit", checkRole("author"), BookController.submitForReview);
router6.delete("/:bookId", checkRole("author"), BookController.deleteBook);
router6.put("/:bookId/sales", checkRole("super_admin", "sub_admin"), BookController.updateSalesData);
var book_routes_default = router6;

// src/routes/financial.routes.ts
var import_express7 = require("express");

// src/services/royalty.service.ts
var RoyaltyService = class {
  // Calculate royalty for a book
  static async calculateBookRoyalty(bookId, platformWiseSales, expenses) {
    const book = await Book_model_default.findOne({ bookId });
    if (!book) {
      throw new Error("Book not found");
    }
    const royaltyData = calculateRoyalty(
      platformWiseSales,
      expenses,
      book.royaltyPercentage
    );
    return {
      bookId,
      bookName: book.bookName,
      authorId: book.authorId,
      ...royaltyData
    };
  }
  // Process royalty payment
  static async processRoyaltyPayment(authorId, bookId, amount, bankAccountId, paymentProof, adminId) {
    const author = await Author_model_default.findOne({ authorId });
    if (!author) {
      throw new Error("Author not found");
    }
    let referralDeduction = 0;
    if (author.referredBy) {
      const referral = await Referral_model_default.findOne({
        referrerId: author.referredBy,
        referredAuthorId: authorId,
        isActive: true
      });
      if (referral) {
        referralDeduction = amount * referral.earningPercentage / 100;
        referral.totalEarnings += referralDeduction;
        referral.availableBalance += referralDeduction;
        await referral.save();
        await Transaction_model_default.create({
          transactionId: generateUniqueId("TXN"),
          authorId: author.referredBy,
          type: "referral_earning",
          amount: referralDeduction,
          description: `Referral earning from ${author.authorId}`,
          status: "completed",
          createdBy: adminId
        });
      }
    }
    const finalAmount = amount - referralDeduction;
    const transaction = await Transaction_model_default.create({
      transactionId: generateUniqueId("TXN"),
      authorId,
      bookId,
      type: "royalty_payment",
      amount: finalAmount,
      description: `Royalty payment for book ${bookId}`,
      status: "completed",
      bankAccountId,
      paymentProof,
      paymentDate: /* @__PURE__ */ new Date(),
      metadata: {
        originalAmount: amount,
        referralDeduction
      },
      createdBy: adminId
    });
    author.totalEarnings += finalAmount;
    await author.save();
    logger_default.info(`Royalty payment processed for author ${authorId}: \u20B9${finalAmount}`);
    return transaction;
  }
  // Get author royalty summary
  static async getAuthorRoyaltySummary(authorId, startDate, endDate) {
    const matchStage = {
      authorId,
      type: "royalty_payment",
      status: "completed"
    };
    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = startDate;
      if (endDate) matchStage.paymentDate.$lte = endDate;
    }
    const summary = await Transaction_model_default.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRoyalty: { $sum: "$amount" },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);
    return summary[0] || { totalRoyalty: 0, totalTransactions: 0 };
  }
  // Get book-wise royalty breakdown
  static async getBookWiseRoyalty(authorId) {
    const royalties = await Transaction_model_default.aggregate([
      {
        $match: {
          authorId,
          type: "royalty_payment",
          status: "completed",
          bookId: { $exists: true }
        }
      },
      {
        $group: {
          _id: "$bookId",
          totalRoyalty: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          lastPayment: { $max: "$paymentDate" }
        }
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "bookId",
          as: "book"
        }
      },
      {
        $unwind: "$book"
      },
      {
        $project: {
          bookId: "$_id",
          bookName: "$book.bookName",
          totalRoyalty: 1,
          transactionCount: 1,
          lastPayment: 1
        }
      },
      {
        $sort: { totalRoyalty: -1 }
      }
    ]);
    return royalties;
  }
};

// src/controllers/financial.controller.ts
var FinancialController = class {
  static {
    // Calculate royalty for a book
    this.calculateRoyalty = asyncHandler(
      async (req, res, _next) => {
        const { bookId, platformWiseSales, expenses } = req.body;
        if (!bookId || !platformWiseSales || !expenses) {
          throw new ApiError_default(
            400,
            "Book ID, platform-wise sales, and expenses are required"
          );
        }
        const book = await Book_model_default.findOne({ bookId });
        if (!book) {
          throw new ApiError_default(404, "Book not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (req.user?.role === "author") {
          const author = await Author_model_default.findOne({ userId });
          if (!author || book.authorId !== author.authorId) {
            throw new ApiError_default(403, "Access denied");
          }
        }
        const royalty = await RoyaltyService.calculateBookRoyalty(
          bookId,
          platformWiseSales,
          expenses
        );
        res.status(200).json({
          success: true,
          data: royalty
        });
      }
    );
  }
  static {
    // Process royalty payment (admin only)
    this.processRoyaltyPayment = asyncHandler(
      async (req, res, _next) => {
        const { authorId, amount, description, relatedBookId } = req.body;
        if (!authorId || !amount) {
          throw new ApiError_default(400, "Author ID and amount are required");
        }
        const author = await Author_model_default.findOne({ authorId });
        if (!author) {
          throw new ApiError_default(404, "Author not found");
        }
        const primaryBank = await BankAccount_model_default.findOne({
          authorId,
          accountType: "primary",
          isVerified: true,
          isActive: true
        });
        if (!primaryBank) {
          throw new ApiError_default(
            400,
            "Author does not have a verified primary bank account"
          );
        }
        const transactionCount = await Transaction_model_default.countDocuments();
        const transactionId = `TXN${(transactionCount + 1).toString().padStart(8, "0")}`;
        const transaction = await Transaction_model_default.create({
          transactionId,
          authorId,
          type: "royalty_payment",
          amount,
          status: "pending",
          description: description || `Royalty payment for ${relatedBookId || "books"}`,
          relatedBookId,
          paymentMethod: "bank_transfer",
          paymentDetails: {
            bankName: primaryBank.bankName,
            accountNumber: primaryBank.accountNumber,
            ifscCode: primaryBank.ifscCode
          }
        });
        res.status(201).json({
          success: true,
          message: "Royalty payment initiated",
          data: { transaction }
        });
      }
    );
  }
  static {
    // Update transaction status (admin only)
    this.updateTransactionStatus = asyncHandler(
      async (req, res, _next) => {
        const { transactionId } = req.params;
        const { status, failureReason } = req.body;
        if (!status) {
          throw new ApiError_default(400, "Status is required");
        }
        const transaction = await Transaction_model_default.findOne({ transactionId });
        if (!transaction) {
          throw new ApiError_default(404, "Transaction not found");
        }
        transaction.status = status;
        if (status === "failed" && failureReason) {
          transaction.failureReason = failureReason;
        }
        if (status === "completed") {
          transaction.completedAt = /* @__PURE__ */ new Date();
          const author = await Author_model_default.findOne({
            authorId: transaction.authorId
          });
          if (author) {
            author.totalEarnings += transaction.amount;
            await author.save();
          }
          if (transaction.relatedBookId) {
            const book = await Book_model_default.findOne({
              bookId: transaction.relatedBookId
            });
            if (book) {
              book.paymentStatus.paidAmount += transaction.amount;
              book.paymentStatus.pendingAmount = book.paymentStatus.totalAmount - book.paymentStatus.paidAmount;
              book.paymentStatus.paymentCompletionPercentage = book.paymentStatus.totalAmount > 0 ? book.paymentStatus.paidAmount / book.paymentStatus.totalAmount * 100 : 0;
              await book.save();
            }
          }
        }
        await transaction.save();
        res.status(200).json({
          success: true,
          message: `Transaction ${status} successfully`,
          data: { transaction }
        });
      }
    );
  }
  static {
    // Get all transactions (admin view)
    this.getAllTransactions = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          type,
          status,
          authorId,
          startDate,
          endDate
        } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (authorId) filter.authorId = authorId;
        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = new Date(startDate);
          if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [transactions, total] = await Promise.all([
          Transaction_model_default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
          Transaction_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            transactions,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Get transaction by ID
    this.getTransactionById = asyncHandler(
      async (req, res, _next) => {
        const { transactionId } = req.params;
        const transaction = await Transaction_model_default.findOne({ transactionId });
        if (!transaction) {
          throw new ApiError_default(404, "Transaction not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (req.user?.role === "author") {
          const author = await Author_model_default.findOne({ userId });
          if (!author || transaction.authorId !== author.authorId) {
            throw new ApiError_default(403, "Access denied");
          }
        }
        res.status(200).json({
          success: true,
          data: { transaction }
        });
      }
    );
  }
  static {
    // Process subscription payment
    this.processSubscriptionPayment = asyncHandler(
      async (req, res, _next) => {
        const { authorId, tier, amount, paymentMethod, paymentDetails } = req.body;
        if (!authorId || !tier || !amount || !paymentMethod) {
          throw new ApiError_default(
            400,
            "Author ID, tier, amount, and payment method are required"
          );
        }
        const author = await Author_model_default.findOne({ authorId });
        if (!author) {
          throw new ApiError_default(404, "Author not found");
        }
        const transactionCount = await Transaction_model_default.countDocuments();
        const transactionId = `TXN${(transactionCount + 1).toString().padStart(8, "0")}`;
        const transaction = await Transaction_model_default.create({
          transactionId,
          authorId,
          type: "subscription",
          amount,
          status: "pending",
          description: `Subscription payment for ${tier} tier`,
          paymentMethod,
          paymentDetails
        });
        res.status(201).json({
          success: true,
          message: "Subscription payment initiated",
          data: { transaction }
        });
      }
    );
  }
  static {
    // Get financial summary for author
    this.getAuthorFinancialSummary = asyncHandler(
      async (req, res, _next) => {
        const { authorId } = req.params;
        const author = await Author_model_default.findOne({ authorId });
        if (!author) {
          throw new ApiError_default(404, "Author not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (req.user?.role === "author") {
          const userAuthor = await Author_model_default.findOne({ userId });
          if (!userAuthor || userAuthor.authorId !== authorId) {
            throw new ApiError_default(403, "Access denied");
          }
        }
        const [
          totalEarnings,
          pendingPayments,
          completedPayments,
          books,
          recentTransactions
        ] = await Promise.all([
          Transaction_model_default.aggregate([
            {
              $match: {
                authorId,
                type: "royalty_payment",
                status: "completed"
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.aggregate([
            {
              $match: {
                authorId,
                type: "royalty_payment",
                status: "pending"
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.find({
            authorId,
            type: "royalty_payment",
            status: "completed"
          }).sort({ completedAt: -1 }).limit(10),
          Book_model_default.find({ authorId, status: "published" }),
          Transaction_model_default.find({ authorId }).sort({ createdAt: -1 }).limit(10)
        ]);
        const totalRevenue = books.reduce(
          (sum, book) => sum + book.totalRevenue,
          0
        );
        const pendingFromBooks = books.reduce(
          (sum, book) => sum + book.paymentStatus.pendingAmount,
          0
        );
        res.status(200).json({
          success: true,
          data: {
            summary: {
              totalEarnings: totalEarnings[0]?.total || 0,
              pendingPayments: pendingPayments[0]?.total || 0,
              totalRevenue,
              pendingFromBooks,
              totalBooks: books.length,
              totalSoldUnits: author.totalSoldUnits
            },
            recentCompletedPayments: completedPayments,
            recentTransactions,
            books: books.map((book) => ({
              bookId: book.bookId,
              bookName: book.bookName,
              totalRevenue: book.totalRevenue,
              totalSellingUnits: book.totalSellingUnits,
              paymentStatus: book.paymentStatus
            }))
          }
        });
      }
    );
  }
  static {
    // Get platform financial analytics (admin only)
    this.getPlatformFinancials = asyncHandler(
      async (req, res, _next) => {
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate || endDate) {
          dateFilter.createdAt = {};
          if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
          if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }
        const [
          totalRevenue,
          totalPaidToAuthors,
          pendingPayments,
          subscriptionRevenue,
          monthlyRevenue
        ] = await Promise.all([
          Book_model_default.aggregate([
            { $match: { status: "published", ...dateFilter } },
            { $group: { _id: null, total: { $sum: "$totalRevenue" } } }
          ]),
          Transaction_model_default.aggregate([
            {
              $match: {
                type: "royalty_payment",
                status: "completed",
                ...dateFilter
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.aggregate([
            {
              $match: {
                type: "royalty_payment",
                status: "pending",
                ...dateFilter
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.aggregate([
            {
              $match: {
                type: "subscription",
                status: "completed",
                ...dateFilter
              }
            },
            { $group: { _id: null, total: { $sum: "$amount" } } }
          ]),
          Transaction_model_default.aggregate([
            {
              $match: {
                status: "completed",
                ...dateFilter
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                revenue: { $sum: "$amount" }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
          ])
        ]);
        const platformEarnings = (totalRevenue[0]?.total || 0) - (totalPaidToAuthors[0]?.total || 0);
        res.status(200).json({
          success: true,
          data: {
            overview: {
              totalRevenue: totalRevenue[0]?.total || 0,
              totalPaidToAuthors: totalPaidToAuthors[0]?.total || 0,
              pendingPayments: pendingPayments[0]?.total || 0,
              platformEarnings,
              subscriptionRevenue: subscriptionRevenue[0]?.total || 0
            },
            monthlyRevenue
          }
        });
      }
    );
  }
};

// src/routes/financial.routes.ts
var router7 = (0, import_express7.Router)();
router7.use(verifyToken);
router7.post("/royalty/calculate", FinancialController.calculateRoyalty);
router7.get("/transactions/:transactionId", FinancialController.getTransactionById);
router7.get("/summary/:authorId", FinancialController.getAuthorFinancialSummary);
router7.use(checkRole("super_admin", "sub_admin"));
router7.post("/royalty/process", FinancialController.processRoyaltyPayment);
router7.put("/transactions/:transactionId/status", FinancialController.updateTransactionStatus);
router7.get("/transactions", FinancialController.getAllTransactions);
router7.post("/subscription/process", FinancialController.processSubscriptionPayment);
router7.get("/platform/analytics", FinancialController.getPlatformFinancials);
var financial_routes_default = router7;

// src/routes/support.routes.ts
var import_express8 = require("express");

// src/models/Message.model.ts
var import_mongoose12 = __toESM(require("mongoose"));
var MessageSchema = new import_mongoose12.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      ref: "Ticket",
      index: true
    },
    senderId: {
      type: String,
      required: true,
      ref: "User"
    },
    senderRole: {
      type: String,
      enum: ["author", "admin", "system"],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachments: [{
      type: String
    }],
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);
MessageSchema.index({ ticketId: 1, createdAt: 1 });
var Message_model_default = import_mongoose12.default.model("Message", MessageSchema);

// src/controllers/support.controller.ts
var SupportController = class {
  static {
    // Create a new support ticket
    this.createTicket = asyncHandler(
      async (req, res, _next) => {
        const { title, category, priority, description, discussionDay, discussionTimeSlot1, discussionTimeSlot2 } = req.body;
        if (!title || !category || !description) {
          throw new ApiError_default(
            400,
            "Title, category, and description are required"
          );
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const ticketCount = await Ticket_model_default.countDocuments();
        const ticketId = `TKT${(ticketCount + 1).toString().padStart(6, "0")}`;
        const ticket = await Ticket_model_default.create({
          ticketId,
          authorId: author.authorId,
          title,
          category,
          priority: priority || "medium",
          description,
          discussionDay,
          discussionTimeSlot1,
          discussionTimeSlot2,
          status: "pending"
        });
        res.status(201).json({
          success: true,
          message: "Support ticket created successfully",
          data: { ticket }
        });
      }
    );
  }
  static {
    // Get all tickets for author
    this.getMyTickets = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 10,
          status,
          category,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const filter = { authorId: author.authorId };
        if (status) {
          filter.status = status;
        }
        if (category) {
          filter.category = category;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const [tickets, total] = await Promise.all([
          Ticket_model_default.find(filter).sort(sort).skip(skip).limit(Number(limit)),
          Ticket_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            tickets,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Get ticket by ID with messages
    this.getTicketById = asyncHandler(
      async (req, res, _next) => {
        const { ticketId } = req.params;
        const ticket = await Ticket_model_default.findOne({ ticketId });
        if (!ticket) {
          throw new ApiError_default(404, "Ticket not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (req.user?.role === "author") {
          const author = await Author_model_default.findOne({ userId });
          if (!author || ticket.authorId !== author.authorId) {
            throw new ApiError_default(403, "Access denied");
          }
        }
        const messages = await Message_model_default.find({ ticketId }).sort({ createdAt: 1 });
        res.status(200).json({
          success: true,
          data: {
            ticket,
            messages
          }
        });
      }
    );
  }
  static {
    // Add message to ticket
    this.addMessage = asyncHandler(
      async (req, res, _next) => {
        const { ticketId } = req.params;
        const { message } = req.body;
        if (!message) {
          throw new ApiError_default(400, "Message is required");
        }
        const ticket = await Ticket_model_default.findOne({ ticketId });
        if (!ticket) {
          throw new ApiError_default(404, "Ticket not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        let senderRole = "author";
        let senderId;
        if (req.user?.role === "author") {
          const author = await Author_model_default.findOne({ userId });
          if (!author || ticket.authorId !== author.authorId) {
            throw new ApiError_default(403, "Access denied");
          }
          senderId = author.authorId;
          senderRole = "author";
        } else {
          senderId = userId;
          senderRole = "admin";
        }
        if (ticket.status === "closed") {
          throw new ApiError_default(400, "Cannot add message to a closed ticket");
        }
        let attachmentUrl;
        if (req.file) {
          attachmentUrl = await UploadService.uploadToCloudinary(req.file.path, "povital/support/attachments");
        }
        const newMessage = await Message_model_default.create({
          ticketId,
          senderId,
          senderRole,
          message,
          attachments: attachmentUrl ? [attachmentUrl] : []
        });
        ticket.lastResponseAt = /* @__PURE__ */ new Date();
        if (ticket.status === "pending" && senderRole === "admin") {
          ticket.status = "in_progress";
        }
        await ticket.save();
        res.status(201).json({
          success: true,
          message: "Message added successfully",
          data: { message: newMessage }
        });
      }
    );
  }
  static {
    // Update ticket status (admin or author can close)
    this.updateTicketStatus = asyncHandler(
      async (req, res, _next) => {
        const { ticketId } = req.params;
        const { status } = req.body;
        if (!status) {
          throw new ApiError_default(400, "Status is required");
        }
        const ticket = await Ticket_model_default.findOne({ ticketId });
        if (!ticket) {
          throw new ApiError_default(404, "Ticket not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (req.user?.role === "author") {
          const author = await Author_model_default.findOne({ userId });
          if (!author || ticket.authorId !== author.authorId) {
            throw new ApiError_default(403, "Access denied");
          }
          if (status !== "closed") {
            throw new ApiError_default(403, "Authors can only close tickets");
          }
        }
        const oldStatus = ticket.status;
        ticket.status = status;
        if (status === "resolved" || status === "closed") {
          ticket.resolvedAt = /* @__PURE__ */ new Date();
        }
        await ticket.save();
        await Message_model_default.create({
          ticketId,
          senderId: userId,
          senderRole: "system",
          message: `Ticket status changed from ${oldStatus} to ${status}`
        });
        res.status(200).json({
          success: true,
          message: `Ticket ${status} successfully`,
          data: { ticket }
        });
      }
    );
  }
  static {
    // Assign ticket to admin (admin only)
    this.assignTicket = asyncHandler(
      async (req, res, _next) => {
        const { ticketId } = req.params;
        const { assignedTo } = req.body;
        const ticket = await Ticket_model_default.findOne({ ticketId });
        if (!ticket) {
          throw new ApiError_default(404, "Ticket not found");
        }
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        ticket.assignedTo = assignedTo || void 0;
        ticket.status = assignedTo ? "in_progress" : "pending";
        await ticket.save();
        await Message_model_default.create({
          ticketId,
          senderId: userId,
          senderRole: "system",
          message: assignedTo ? `Ticket assigned to ${assignedTo}` : "Ticket unassigned"
        });
        res.status(200).json({
          success: true,
          message: "Ticket assignment updated",
          data: { ticket }
        });
      }
    );
  }
  static {
    // Get ticket statistics (admin only)
    this.getTicketStats = asyncHandler(
      async (_req, res, _next) => {
        const [
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          categoryDistribution,
          priorityDistribution
        ] = await Promise.all([
          Ticket_model_default.countDocuments(),
          Ticket_model_default.countDocuments({ status: "pending" }),
          Ticket_model_default.countDocuments({ status: "in_progress" }),
          Ticket_model_default.countDocuments({ status: "resolved" }),
          Ticket_model_default.countDocuments({ status: "closed" }),
          Ticket_model_default.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
          ]),
          Ticket_model_default.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } }
          ])
        ]);
        const resolvedTicketsWithTime = await Ticket_model_default.find({
          status: { $in: ["resolved", "closed"] },
          resolvedAt: { $exists: true }
        }).select("createdAt resolvedAt");
        let avgResolutionTime = 0;
        if (resolvedTicketsWithTime.length > 0) {
          const totalTime = resolvedTicketsWithTime.reduce((sum, ticket) => {
            const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
            return sum + resolutionTime;
          }, 0);
          avgResolutionTime = totalTime / resolvedTicketsWithTime.length;
        }
        res.status(200).json({
          success: true,
          data: {
            overview: {
              totalTickets,
              openTickets,
              inProgressTickets,
              resolvedTickets,
              closedTickets,
              avgResolutionTimeHours: avgResolutionTime / (1e3 * 60 * 60)
            },
            categoryDistribution,
            priorityDistribution
          }
        });
      }
    );
  }
  static {
    // Search tickets (admin only)
    this.searchTickets = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          search,
          status,
          category,
          priority,
          assignedTo,
          authorId
        } = req.query;
        const filter = {};
        if (search) {
          filter.$or = [
            { title: new RegExp(search, "i") },
            { description: new RegExp(search, "i") },
            { ticketId: new RegExp(search, "i") }
          ];
        }
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (authorId) filter.authorId = authorId;
        const skip = (Number(page) - 1) * Number(limit);
        const [tickets, total] = await Promise.all([
          Ticket_model_default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
          Ticket_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            tickets,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
};

// src/routes/support.routes.ts
var router8 = (0, import_express8.Router)();
router8.use(verifyToken);
router8.post("/tickets", checkRole("author"), SupportController.createTicket);
router8.get("/tickets", checkRole("author"), SupportController.getMyTickets);
router8.get("/tickets/:ticketId", SupportController.getTicketById);
router8.post("/tickets/:ticketId/messages", uploadSingle("attachment"), SupportController.addMessage);
router8.put("/tickets/:ticketId/status", SupportController.updateTicketStatus);
router8.get("/admin/tickets", checkRole("super_admin", "sub_admin"), SupportController.searchTickets);
router8.get("/admin/tickets/search", checkRole("super_admin", "sub_admin"), SupportController.searchTickets);
router8.get("/admin/tickets/stats", checkRole("super_admin", "sub_admin"), SupportController.getTicketStats);
router8.put("/admin/tickets/:ticketId/assign", checkRole("super_admin", "sub_admin"), SupportController.assignTicket);
router8.put("/admin/tickets/:ticketId/status", checkRole("super_admin", "sub_admin"), SupportController.updateTicketStatus);
var support_routes_default = router8;

// src/routes/referral.routes.ts
var import_express9 = require("express");

// src/controllers/referral.controller.ts
var ReferralController = class {
  static {
    // Get referral details for author
    this.getReferralDetails = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const [referrals, totalEarnings, pendingEarnings] = await Promise.all([
          Referral_model_default.find({ referrerId: author.authorId }).sort({ createdAt: -1 }),
          Referral_model_default.aggregate([
            { $match: { referrerId: author.authorId, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
          ]),
          Referral_model_default.aggregate([
            { $match: { referrerId: author.authorId, status: "pending" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
          ])
        ]);
        const referredAuthorIds = referrals.map((r) => r.referredAuthorId);
        const referredAuthors = await Author_model_default.find({
          authorId: { $in: referredAuthorIds }
        }).select("authorId userId totalBooks totalEarnings createdAt").lean();
        const referredUserIds = referredAuthors.map((a) => a.userId);
        const referredUsers = await User_model_default.find({
          userId: { $in: referredUserIds }
        }).select("userId firstName lastName").lean();
        res.status(200).json({
          success: true,
          data: {
            referralCode: author.referralCode,
            totalReferrals: referrals.length,
            totalEarnings: totalEarnings[0]?.total || 0,
            pendingEarnings: pendingEarnings[0]?.total || 0,
            referrals: referrals.map((ref) => {
              const refAuthor = referredAuthors.find((a) => a.authorId === ref.referredAuthorId);
              const refUser = refAuthor ? referredUsers.find((u) => u.userId === refAuthor.userId) : null;
              return {
                ...ref.toObject(),
                referredAuthorDetails: refAuthor ? {
                  authorId: refAuthor.authorId,
                  firstName: refUser?.firstName || "",
                  lastName: refUser?.lastName || "",
                  totalBooks: refAuthor.totalBooks,
                  totalEarnings: refAuthor.totalEarnings,
                  createdAt: refAuthor.createdAt
                } : null
              };
            })
          }
        });
      }
    );
  }
  static {
    // Process referral commission (admin only)
    this.processReferralCommission = asyncHandler(
      async (req, res, _next) => {
        const { referralId } = req.params;
        const referral = await Referral_model_default.findById(referralId);
        if (!referral) {
          throw new ApiError_default(404, "Referral not found");
        }
        if (referral.status === "completed") {
          throw new ApiError_default(400, "Commission already processed");
        }
        const referrer = await Author_model_default.findOne({
          authorId: referral.referrerId
        });
        if (!referrer) {
          throw new ApiError_default(404, "Referrer not found");
        }
        const transactionCount = await Transaction_model_default.countDocuments();
        const transactionId = `TXN${(transactionCount + 1).toString().padStart(8, "0")}`;
        await Transaction_model_default.create({
          transactionId,
          authorId: referral.referrerId,
          type: "referral_commission",
          amount: referral.commissionAmount,
          status: "completed",
          description: `Referral commission for ${referral.referredAuthorId}`,
          completedAt: /* @__PURE__ */ new Date()
        });
        referral.status = "completed";
        await referral.save();
        referrer.totalEarnings += referral.commissionAmount;
        await referrer.save();
        res.status(200).json({
          success: true,
          message: "Referral commission processed successfully",
          data: { referral }
        });
      }
    );
  }
  static {
    // Get all referrals (admin only)
    this.getAllReferrals = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          status,
          referrerId,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;
        const filter = {};
        if (status) {
          filter.status = status;
        }
        if (referrerId) {
          filter.referrerId = referrerId;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const [referrals, total] = await Promise.all([
          Referral_model_default.find(filter).sort(sort).skip(skip).limit(Number(limit)),
          Referral_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            referrals,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Get referral statistics (admin only)
    this.getReferralStats = asyncHandler(
      async (_req, res, _next) => {
        const [
          totalReferrals,
          activeReferrals,
          completedReferrals,
          totalCommissionPaid,
          totalCommissionPending,
          topReferrers
        ] = await Promise.all([
          Referral_model_default.countDocuments(),
          Referral_model_default.countDocuments({ status: "pending" }),
          Referral_model_default.countDocuments({ status: "completed" }),
          Referral_model_default.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
          ]),
          Referral_model_default.aggregate([
            { $match: { status: "pending" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
          ]),
          Referral_model_default.aggregate([
            {
              $group: {
                _id: "$referrerId",
                count: { $sum: 1 },
                totalEarnings: { $sum: "$commissionAmount" }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ])
        ]);
        const topReferrerIds = topReferrers.map((r) => r._id);
        await Author_model_default.find({
          authorId: { $in: topReferrerIds }
        }).select("authorId");
        res.status(200).json({
          success: true,
          data: {
            overview: {
              totalReferrals,
              activeReferrals,
              completedReferrals,
              totalCommissionPaid: totalCommissionPaid[0]?.total || 0,
              totalCommissionPending: totalCommissionPending[0]?.total || 0
            },
            topReferrers: topReferrers.map((ref) => ({
              authorId: ref._id,
              referralCount: ref.count,
              totalEarnings: ref.totalEarnings
            }))
          }
        });
      }
    );
  }
  static {
    // Validate referral code (public endpoint for signup)
    this.validateReferralCode = asyncHandler(
      async (req, res, _next) => {
        const { referralCode } = req.params;
        if (!referralCode) {
          throw new ApiError_default(400, "Referral code is required");
        }
        const author = await Author_model_default.findOne({
          referralCode: referralCode.toUpperCase()
        });
        if (!author) {
          res.status(200).json({
            success: true,
            valid: false,
            message: "Invalid referral code"
          });
          return;
        }
        if (author.isRestricted) {
          res.status(200).json({
            success: true,
            valid: false,
            message: "Referral code is not active"
          });
          return;
        }
        res.status(200).json({
          success: true,
          valid: true,
          message: "Valid referral code",
          data: {
            referrerId: author.authorId
          }
        });
      }
    );
  }
  static {
    // Update commission amount for a referral (admin only)
    this.updateCommission = asyncHandler(
      async (req, res, _next) => {
        const { referralId } = req.params;
        const { commissionAmount } = req.body;
        if (commissionAmount === void 0 || commissionAmount < 0) {
          throw new ApiError_default(400, "Valid commission amount is required");
        }
        const referral = await Referral_model_default.findById(referralId);
        if (!referral) {
          throw new ApiError_default(404, "Referral not found");
        }
        if (referral.status === "completed") {
          throw new ApiError_default(400, "Cannot update completed referral commission");
        }
        referral.commissionAmount = commissionAmount;
        await referral.save();
        res.status(200).json({
          success: true,
          message: "Commission amount updated successfully",
          data: { referral }
        });
      }
    );
  }
};

// src/routes/referral.routes.ts
var router9 = (0, import_express9.Router)();
router9.get("/validate/:referralCode", ReferralController.validateReferralCode);
router9.use(verifyToken);
router9.get("/my-referrals", checkRole("author"), ReferralController.getReferralDetails);
router9.use(checkRole("super_admin", "sub_admin"));
router9.get("/", ReferralController.getAllReferrals);
router9.get("/stats", ReferralController.getReferralStats);
router9.post("/:referralId/process", ReferralController.processReferralCommission);
router9.put("/:referralId/commission", ReferralController.updateCommission);
var referral_routes_default = router9;

// src/routes/utility.routes.ts
var import_express10 = require("express");

// src/controllers/utility.controller.ts
var import_https = __toESM(require("https"));
var UtilityController = class {
  static {
    this.pincodeLookup = asyncHandler(
      async (req, res, _next) => {
        const { pin } = req.params;
        if (!pin || !/^\d{6}$/.test(pin)) {
          throw new ApiError_default(400, "Invalid PIN code. Must be exactly 6 digits.");
        }
        const data = await new Promise((resolve, reject) => {
          const url = `https://api.postalpincode.in/pincode/${pin}`;
          const request = import_https.default.get(url, { timeout: 8e3 }, (response) => {
            let body = "";
            response.on("data", (chunk) => body += chunk);
            response.on("end", () => {
              try {
                resolve(JSON.parse(body));
              } catch {
                reject(new Error("Failed to parse PIN code API response"));
              }
            });
          });
          request.on("error", (err) => reject(err));
          request.on("timeout", () => {
            request.destroy();
            reject(new Error("PIN code API request timed out"));
          });
        });
        if (!data || !Array.isArray(data) || data[0]?.Status !== "Success" || !data[0]?.PostOffice?.length) {
          throw new ApiError_default(404, "No results found for this PIN code");
        }
        const postOffice = data[0].PostOffice[0];
        res.status(200).json({
          success: true,
          data: {
            division: postOffice.Division || "",
            city: postOffice.Block || postOffice.Name || "",
            district: postOffice.District || "",
            state: postOffice.State || "",
            country: postOffice.Country || "India"
          }
        });
      }
    );
  }
};

// src/routes/utility.routes.ts
var router10 = (0, import_express10.Router)();
router10.get("/pincode/:pin", UtilityController.pincodeLookup);
var utility_routes_default = router10;

// src/routes/payment-config.routes.ts
var import_express11 = require("express");

// src/models/PlatformConfig.model.ts
var import_mongoose13 = __toESM(require("mongoose"));
var PlatformConfigSchema = new import_mongoose13.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    values: [{
      type: String,
      trim: true
    }],
    updatedBy: {
      type: String
    }
  },
  { timestamps: true }
);
var PlatformConfig_model_default = import_mongoose13.default.model("PlatformConfig", PlatformConfigSchema);

// src/controllers/payment-config.controller.ts
var PaymentConfigController = class _PaymentConfigController {
  static {
    // Get all configs (admin)
    this.getAllConfigs = asyncHandler(
      async (_req, res, _next) => {
        const configs = await PricingConfig_model_default.find().sort({ language: 1 });
        const bookTypes = await PlatformConfig_model_default.findOne({ key: "bookTypes" });
        res.status(200).json({
          success: true,
          data: { configs, bookTypes: bookTypes?.values || [] }
        });
      }
    );
  }
  static {
    // Get single config by ID (admin)
    this.getConfigById = asyncHandler(
      async (req, res, _next) => {
        const config2 = await PricingConfig_model_default.findById(req.params.id);
        if (!config2) throw new ApiError_default(404, "Configuration not found");
        res.status(200).json({ success: true, data: { config: config2 } });
      }
    );
  }
  // Transform frontend payload to match DB schema
  static transformPayload(body) {
    const s = body.services || {};
    const toPrice = (obj) => ({
      main: parseFloat(obj?.price ?? obj?.main ?? 0),
      discount: parseFloat(obj?.discount ?? 0)
    });
    const installmentMap = {
      full: { label: "Full Payment", splits: [100] },
      two: { label: "2 Installments", splits: [50, 50] },
      three: { label: "3 Installments", splits: [25, 50, 25] },
      four: { label: "4 Installments", splits: [25, 50, 25, 0] }
    };
    const rawInstallments = body.installmentOptions || [];
    const installmentOptions = rawInstallments.map((opt) => {
      if (typeof opt === "string") return installmentMap[opt] || { label: opt, splits: [100] };
      return opt;
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
        perReferralBonus: parseFloat(ref.perReferralBonus ?? 0)
      },
      platforms: body.platforms || [],
      benefits: body.benefits || [],
      isActive: body.isActive !== void 0 ? body.isActive : true
    };
  }
  static {
    // Create new language config (admin)
    this.createConfig = asyncHandler(
      async (req, res, _next) => {
        const { language } = req.body;
        if (!language) throw new ApiError_default(400, "Language is required");
        const existing = await PricingConfig_model_default.findOne({ language: { $regex: new RegExp(`^${language}$`, "i") } });
        if (existing) throw new ApiError_default(400, `Configuration for "${language}" already exists`);
        const transformed = _PaymentConfigController.transformPayload(req.body);
        const config2 = await PricingConfig_model_default.create({
          ...transformed,
          createdBy: req.user?.userId || "system"
        });
        res.status(201).json({
          success: true,
          message: `Pricing configuration for "${language}" created successfully`,
          data: { config: config2 }
        });
      }
    );
  }
  static {
    // Update config (admin)
    this.updateConfig = asyncHandler(
      async (req, res, _next) => {
        const config2 = await PricingConfig_model_default.findById(req.params.id);
        if (!config2) throw new ApiError_default(404, "Configuration not found");
        if (req.body.language && req.body.language !== config2.language) {
          const existing = await PricingConfig_model_default.findOne({
            language: { $regex: new RegExp(`^${req.body.language}$`, "i") },
            _id: { $ne: config2._id }
          });
          if (existing) throw new ApiError_default(400, `Configuration for "${req.body.language}" already exists`);
        }
        const transformed = _PaymentConfigController.transformPayload(req.body);
        Object.assign(config2, transformed);
        await config2.save();
        res.status(200).json({
          success: true,
          message: "Configuration updated successfully",
          data: { config: config2 }
        });
      }
    );
  }
  static {
    // Delete config (admin)
    this.deleteConfig = asyncHandler(
      async (req, res, _next) => {
        const config2 = await PricingConfig_model_default.findById(req.params.id);
        if (!config2) throw new ApiError_default(404, "Configuration not found");
        await PricingConfig_model_default.deleteOne({ _id: config2._id });
        res.status(200).json({
          success: true,
          message: `Configuration for "${config2.language}" deleted successfully`
        });
      }
    );
  }
  static {
    // Get active configs (public - for author book form)
    this.getPublicConfig = asyncHandler(
      async (_req, res, _next) => {
        const configs = await PricingConfig_model_default.find({ isActive: true }).select("-createdBy -__v").sort({ language: 1 });
        const bookTypes = await PlatformConfig_model_default.findOne({ key: "bookTypes" });
        res.status(200).json({
          success: true,
          data: {
            configs,
            languages: configs.map((c) => c.language),
            bookTypes: bookTypes?.values || []
          }
        });
      }
    );
  }
  static {
    // ---- Book Types Management (admin) ----
    // Get book types
    this.getBookTypes = asyncHandler(
      async (_req, res, _next) => {
        const doc = await PlatformConfig_model_default.findOne({ key: "bookTypes" });
        res.status(200).json({
          success: true,
          data: { bookTypes: doc?.values || [] }
        });
      }
    );
  }
  static {
    // Update book types (replace entire list)
    this.updateBookTypes = asyncHandler(
      async (req, res, _next) => {
        const { bookTypes } = req.body;
        if (!Array.isArray(bookTypes)) throw new ApiError_default(400, "bookTypes must be an array");
        const doc = await PlatformConfig_model_default.findOneAndUpdate(
          { key: "bookTypes" },
          { values: bookTypes, updatedBy: req.user?.userId || "system" },
          { upsert: true, new: true }
        );
        res.status(200).json({
          success: true,
          message: "Book types updated successfully",
          data: { bookTypes: doc.values }
        });
      }
    );
  }
};

// src/routes/payment-config.routes.ts
var router11 = (0, import_express11.Router)();
router11.get("/public", PaymentConfigController.getPublicConfig);
router11.use(verifyToken);
router11.use(checkRole("super_admin", "sub_admin"));
router11.get("/", PaymentConfigController.getAllConfigs);
router11.post("/", PaymentConfigController.createConfig);
router11.get("/book-types", PaymentConfigController.getBookTypes);
router11.put("/book-types", PaymentConfigController.updateBookTypes);
router11.get("/:id", PaymentConfigController.getConfigById);
router11.put("/:id", PaymentConfigController.updateConfig);
router11.delete("/:id", PaymentConfigController.deleteConfig);
var payment_config_routes_default = router11;

// src/routes/review.routes.ts
var import_express12 = require("express");

// src/models/Review.model.ts
var import_mongoose14 = __toESM(require("mongoose"));
var ReviewSchema = new import_mongoose14.Schema(
  {
    reviewId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    authorId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    reviewText: {
      type: String,
      required: true,
      maxlength: 1e3,
      trim: true
    },
    attachment: {
      type: String
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
ReviewSchema.index({ isVisible: 1, createdAt: -1 });
ReviewSchema.index({ authorId: 1, createdAt: -1 });
var Review_model_default = import_mongoose14.default.model("Review", ReviewSchema);

// src/controllers/review.controller.ts
var ReviewController = class {
  static {
    // Author submits a review
    this.submitReview = asyncHandler(
      async (req, res, _next) => {
        const { rating, reviewText, attachment } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        if (!rating || !reviewText) {
          throw new ApiError_default(400, "Rating and review text are required");
        }
        if (rating < 1 || rating > 5) {
          throw new ApiError_default(400, "Rating must be between 1 and 5");
        }
        if (reviewText.length > 1e3) {
          throw new ApiError_default(400, "Review text must be at most 1000 characters");
        }
        const author = await Author_model_default.findOne({ userId });
        if (!author) {
          throw new ApiError_default(404, "Author profile not found");
        }
        const reviewCount = await Review_model_default.countDocuments();
        const reviewId = `REV${(reviewCount + 1).toString().padStart(5, "0")}`;
        const review = await Review_model_default.create({
          reviewId,
          authorId: author.authorId,
          userId,
          rating,
          reviewText,
          attachment: attachment || void 0
        });
        res.status(201).json({
          success: true,
          message: "Review submitted successfully",
          data: { review }
        });
      }
    );
  }
  static {
    // Author gets own review
    this.getMyReview = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        if (!userId) throw new ApiError_default(401, "Unauthorized");
        const review = await Review_model_default.findOne({ userId }).lean();
        res.status(200).json({ success: true, data: { review: review || null } });
      }
    );
  }
  static {
    // Author updates own review
    this.updateReview = asyncHandler(
      async (req, res, _next) => {
        const { id } = req.params;
        const { rating, reviewText, attachment } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
          throw new ApiError_default(401, "Unauthorized");
        }
        const review = await Review_model_default.findOne({ reviewId: id });
        if (!review) {
          throw new ApiError_default(404, "Review not found");
        }
        if (review.userId !== userId) {
          throw new ApiError_default(403, "You can only edit your own reviews");
        }
        if (rating !== void 0) {
          if (rating < 1 || rating > 5) {
            throw new ApiError_default(400, "Rating must be between 1 and 5");
          }
          review.rating = rating;
        }
        if (reviewText !== void 0) {
          if (reviewText.length > 1e3) {
            throw new ApiError_default(400, "Review text must be at most 1000 characters");
          }
          review.reviewText = reviewText;
        }
        if (attachment !== void 0) {
          review.attachment = attachment || void 0;
        }
        await review.save();
        res.status(200).json({
          success: true,
          message: "Review updated successfully",
          data: { review }
        });
      }
    );
  }
  static {
    // Public: get all visible reviews
    this.getPublicReviews = asyncHandler(
      async (req, res, _next) => {
        const {
          page = 1,
          limit = 20,
          sortBy = "createdAt",
          sortOrder = "desc"
        } = req.query;
        const filter = { isVisible: true };
        const skip = (Number(page) - 1) * Number(limit);
        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const [reviews, total] = await Promise.all([
          Review_model_default.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
          Review_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            reviews,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      }
    );
  }
  static {
    // Admin: get all reviews
    this.adminGetAllReviews = asyncHandler(
      async (req, res, _next) => {
        const { page = 1, limit = 20, rating, search } = req.query;
        const filter = {};
        if (rating) filter.rating = Number(rating);
        if (search) filter.reviewText = { $regex: search, $options: "i" };
        const skip = (Number(page) - 1) * Number(limit);
        const [reviews, total] = await Promise.all([
          Review_model_default.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
          Review_model_default.countDocuments(filter)
        ]);
        res.status(200).json({
          success: true,
          data: {
            reviews,
            pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
          }
        });
      }
    );
  }
  static {
    // Admin edits any review
    this.adminEditReview = asyncHandler(
      async (req, res, _next) => {
        const { id } = req.params;
        const { rating, reviewText, attachment, isVisible } = req.body;
        const review = await Review_model_default.findOne({ reviewId: id });
        if (!review) {
          throw new ApiError_default(404, "Review not found");
        }
        if (rating !== void 0) {
          if (rating < 1 || rating > 5) {
            throw new ApiError_default(400, "Rating must be between 1 and 5");
          }
          review.rating = rating;
        }
        if (reviewText !== void 0) {
          if (reviewText.length > 1e3) {
            throw new ApiError_default(400, "Review text must be at most 1000 characters");
          }
          review.reviewText = reviewText;
        }
        if (attachment !== void 0) {
          review.attachment = attachment || void 0;
        }
        if (isVisible !== void 0) {
          review.isVisible = isVisible;
        }
        await review.save();
        res.status(200).json({
          success: true,
          message: "Review updated successfully",
          data: { review }
        });
      }
    );
  }
  static {
    // Admin deletes a review
    this.adminDeleteReview = asyncHandler(
      async (req, res, _next) => {
        const { id } = req.params;
        const review = await Review_model_default.findOne({ reviewId: id });
        if (!review) {
          throw new ApiError_default(404, "Review not found");
        }
        await Review_model_default.deleteOne({ reviewId: id });
        res.status(200).json({
          success: true,
          message: "Review deleted successfully"
        });
      }
    );
  }
};

// src/routes/review.routes.ts
var router12 = (0, import_express12.Router)();
router12.get("/public", ReviewController.getPublicReviews);
router12.get("/my", verifyToken, checkRole("author"), ReviewController.getMyReview);
router12.post("/", verifyToken, checkRole("author"), ReviewController.submitReview);
router12.put("/:id", verifyToken, checkRole("author"), ReviewController.updateReview);
router12.get("/admin", verifyToken, checkRole("super_admin", "sub_admin"), ReviewController.adminGetAllReviews);
router12.put("/admin/:id", verifyToken, checkRole("super_admin", "sub_admin"), ReviewController.adminEditReview);
router12.delete("/admin/:id", verifyToken, checkRole("super_admin", "sub_admin"), ReviewController.adminDeleteReview);
var review_routes_default = router12;

// src/routes/payment.routes.ts
var import_express13 = require("express");

// src/controllers/payment.controller.ts
var import_crypto4 = __toESM(require("crypto"));
var import_razorpay = __toESM(require("razorpay"));
var getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new ApiError_default(500, "Razorpay credentials not configured");
  return new import_razorpay.default({ key_id: keyId, key_secret: keySecret });
};
var PaymentController = class {
  static {
    // Create Razorpay order for a book payment (initial or installment)
    this.createOrder = asyncHandler(
      async (req, res, _next) => {
        const { bookId } = req.body;
        if (!bookId) throw new ApiError_default(400, "bookId is required");
        const userId = req.user?.userId;
        const author = await Author_model_default.findOne({ userId });
        if (!author) throw new ApiError_default(404, "Author not found");
        const book = await Book_model_default.findOne({ bookId, authorId: author.authorId });
        if (!book) throw new ApiError_default(404, "Book not found");
        const pendingAmount = book.paymentStatus.pendingAmount;
        if (pendingAmount <= 0) throw new ApiError_default(400, "No pending amount for this book");
        let amountToPay = pendingAmount;
        const plan = book.paymentPlan;
        const totalAmount = book.paymentStatus.totalAmount;
        const alreadyPaid = book.paymentStatus.paidAmount;
        if (plan === "2_installments") {
          const each = Math.ceil(totalAmount / 2);
          amountToPay = Math.min(each, pendingAmount);
        } else if (plan === "3_installments") {
          const splits = [0.25, 0.5, 0.25];
          const paidCount = book.paymentStatus.installments.filter((i) => i.status === "paid").length;
          const splitIndex = Math.min(paidCount, splits.length - 1);
          amountToPay = Math.min(Math.ceil(totalAmount * splits[splitIndex]), pendingAmount);
        } else if (plan === "4_installments") {
          const each = Math.ceil(totalAmount / 4);
          amountToPay = Math.min(each, pendingAmount);
        }
        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
          amount: Math.round(amountToPay * 100),
          currency: "INR",
          receipt: `${bookId}_${Date.now()}`,
          notes: {
            bookId,
            authorId: author.authorId,
            paymentType: alreadyPaid > 0 ? "installment" : "initial"
          }
        });
        const user = await User_model_default.findOne({ userId: author.userId }).lean();
        const authorName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : author.authorId;
        res.status(200).json({
          success: true,
          data: {
            orderId: order.id,
            amount: amountToPay,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            bookId,
            bookName: book.bookName,
            authorName
          }
        });
      }
    );
  }
  static {
    // Verify Razorpay payment signature and update book
    this.verifyPayment = asyncHandler(
      async (req, res, _next) => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookId } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookId) {
          throw new ApiError_default(400, "Missing payment verification fields");
        }
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) throw new ApiError_default(500, "Razorpay credentials not configured");
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = import_crypto4.default.createHmac("sha256", keySecret).update(body).digest("hex");
        if (expectedSignature !== razorpay_signature) {
          throw new ApiError_default(400, "Payment signature verification failed");
        }
        const userId = req.user?.userId;
        const author = await Author_model_default.findOne({ userId });
        if (!author) throw new ApiError_default(404, "Author not found");
        const book = await Book_model_default.findOne({ bookId, authorId: author.authorId });
        if (!book) throw new ApiError_default(404, "Book not found");
        const razorpay = getRazorpay();
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        const paidAmountRupees = Number(payment.amount) / 100;
        book.paymentStatus.paidAmount += paidAmountRupees;
        book.paymentStatus.pendingAmount = Math.max(
          0,
          book.paymentStatus.totalAmount - book.paymentStatus.paidAmount
        );
        book.paymentStatus.paymentCompletionPercentage = Math.round(
          book.paymentStatus.paidAmount / book.paymentStatus.totalAmount * 100
        );
        book.paymentStatus.installments.push({
          amount: paidAmountRupees,
          status: "paid",
          paidAt: /* @__PURE__ */ new Date()
        });
        if (book.status === "payment_pending" || book.status === "draft") {
          book.status = "pending";
        }
        await book.save();
        const user = await User_model_default.findOne({ userId: author.userId }).select("firstName lastName email").lean();
        if (user?.email) {
          const paidInstallments = book.paymentStatus.installments.filter((i) => i.status === "paid").length;
          const totalInstallments = book.paymentPlan === "full" ? 1 : book.paymentPlan === "2_installments" ? 2 : book.paymentPlan === "4_installments" ? 4 : book.paymentPlan === "3_installments" ? 3 : 1;
          EmailService.sendBookPaymentConfirmationEmail(
            user.email,
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Author",
            book.bookName,
            book.bookId,
            paidAmountRupees,
            book.paymentStatus.totalAmount,
            book.paymentStatus.pendingAmount,
            razorpay_payment_id,
            paidInstallments,
            totalInstallments
          );
        }
        await Transaction_model_default.create({
          authorId: author.authorId,
          bookId,
          type: "book_payment",
          amount: paidAmountRupees,
          status: "completed",
          transactionId: razorpay_payment_id,
          description: `Book payment for "${book.bookName}"`,
          createdBy: userId,
          metadata: {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
          }
        });
        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          data: {
            bookId,
            paidAmount: book.paymentStatus.paidAmount,
            pendingAmount: book.paymentStatus.pendingAmount,
            paymentCompletionPercentage: book.paymentStatus.paymentCompletionPercentage,
            status: book.status
          }
        });
      }
    );
  }
  static {
    // Razorpay webhook (called by Razorpay directly — no auth)
    this.webhook = asyncHandler(
      async (req, res, _next) => {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
          res.status(200).json({ received: true });
          return;
        }
        const signature = req.headers["x-razorpay-signature"];
        const body = JSON.stringify(req.body);
        const expectedSignature = import_crypto4.default.createHmac("sha256", webhookSecret).update(body).digest("hex");
        if (signature !== expectedSignature) {
          res.status(400).json({ error: "Invalid webhook signature" });
          return;
        }
        const event = req.body;
        if (event.event === "payment.captured") {
          const payment = event.payload?.payment?.entity;
          if (payment?.notes?.bookId) {
            const book = await Book_model_default.findOne({ bookId: payment.notes.bookId });
            if (book && book.status === "payment_pending") {
              book.status = "pending";
              await book.save();
            }
          }
        }
        res.status(200).json({ received: true });
      }
    );
  }
  static {
    // Get pending payment requests for author dashboard
    this.getPendingPaymentRequests = asyncHandler(
      async (req, res, _next) => {
        const userId = req.user?.userId;
        const author = await Author_model_default.findOne({ userId });
        if (!author) throw new ApiError_default(404, "Author not found");
        const books = await Book_model_default.find({
          authorId: author.authorId,
          $or: [
            { "paymentRequests.status": "pending" },
            { status: "payment_pending" }
          ]
        }).select("bookId bookName paymentStatus paymentRequests paymentPlan status");
        const requests = [];
        for (const book of books) {
          if (book.status === "payment_pending") {
            requests.push({
              type: "installment",
              bookId: book.bookId,
              bookName: book.bookName,
              amount: book.paymentStatus.pendingAmount,
              dueDate: book.paymentStatus.dueDate,
              status: "overdue"
            });
          }
          for (const pr of book.paymentRequests || []) {
            if (pr.status === "pending") {
              requests.push({
                type: "admin_request",
                bookId: book.bookId,
                bookName: book.bookName,
                amount: pr.amount,
                serviceType: pr.serviceType,
                description: pr.description,
                createdAt: pr.createdAt,
                status: "pending"
              });
            }
          }
        }
        res.status(200).json({ success: true, data: { requests } });
      }
    );
  }
};

// src/routes/payment.routes.ts
var router13 = (0, import_express13.Router)();
router13.post("/webhook", PaymentController.webhook);
router13.use(verifyToken);
router13.use(checkRole("author"));
router13.post("/create-order", PaymentController.createOrder);
router13.post("/verify", PaymentController.verifyPayment);
router13.get("/pending-requests", PaymentController.getPendingPaymentRequests);
var payment_routes_default = router13;

// src/routes/selling.routes.ts
var import_express14 = require("express");

// src/models/SellingRecord.model.ts
var import_mongoose15 = __toESM(require("mongoose"));
var PlatformSaleSchema = new import_mongoose15.Schema(
  {
    platform: { type: String, required: true },
    sellingUnits: { type: Number, required: true, min: 0, default: 0 },
    sellingPricePerUnit: { type: Number, required: true, min: 0, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  { _id: false }
);
var SellingRecordSchema = new import_mongoose15.Schema(
  {
    sellingRecordId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    bookId: {
      type: String,
      required: true,
      ref: "Book",
      index: true
    },
    authorId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    platformSales: [PlatformSaleSchema],
    // Expense inputs
    costPerBook: { type: Number, default: 0 },
    adsCostPerUnit: { type: Number, default: 0 },
    platformFees: { type: Number, default: 0 },
    returnsExchangeAmount: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    // Calculated
    totalSellingUnits: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    productionCost: { type: Number, default: 0 },
    grossMargin: { type: Number, default: 0 },
    adsCost: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    authorRoyalty: { type: Number, default: 0 },
    royaltyPercentage: { type: Number, default: 70 },
    createdBy: { type: String, required: true }
  },
  {
    timestamps: true
  }
);
SellingRecordSchema.index({ bookId: 1, year: -1, month: -1 });
SellingRecordSchema.index({ authorId: 1, year: -1, month: -1 });
var SellingRecord_model_default = import_mongoose15.default.model("SellingRecord", SellingRecordSchema);

// src/models/RoyaltyRecord.model.ts
var import_mongoose16 = __toESM(require("mongoose"));
var RoyaltyRecordSchema = new import_mongoose16.Schema(
  {
    royaltyRecordId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    authorId: {
      type: String,
      required: true,
      ref: "Author",
      index: true
    },
    bookId: {
      type: String,
      required: true,
      ref: "Book"
    },
    sellingRecordId: {
      type: String,
      required: true,
      ref: "SellingRecord"
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    // Financials
    authorRoyalty: { type: Number, default: 0 },
    referralDeduction: { type: Number, default: 0 },
    outstandingDeduction: { type: Number, default: 0 },
    finalRoyalty: { type: Number, default: 0 },
    // Payment
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending"
    },
    bankAccountId: { type: String },
    paymentProof: { type: String },
    paymentMode: { type: String },
    transactionReference: { type: String },
    paymentDate: { type: Date },
    paidBy: { type: String },
    transactionId: { type: String }
  },
  {
    timestamps: true
  }
);
RoyaltyRecordSchema.index({ authorId: 1, year: -1, month: -1 });
RoyaltyRecordSchema.index({ bookId: 1, year: -1 });
RoyaltyRecordSchema.index({ status: 1 });
var RoyaltyRecord_model_default = import_mongoose16.default.model("RoyaltyRecord", RoyaltyRecordSchema);

// src/controllers/selling.controller.ts
function genId(prefix, count) {
  return `${prefix}${(count + 1).toString().padStart(8, "0")}`;
}
var submitSellingData = asyncHandler(
  async (req, res, _next) => {
    const adminUserId = req.user?.userId;
    if (!adminUserId) throw new ApiError_default(401, "Unauthorized");
    const {
      bookId,
      month,
      year,
      platformSales,
      // [{ platform, sellingUnits, sellingPricePerUnit }]
      costPerBook,
      adsCostPerUnit,
      platformFees,
      returnsExchangeAmount,
      outstandingAmount
    } = req.body;
    if (!bookId || !month || !year || !Array.isArray(platformSales)) {
      throw new ApiError_default(400, "bookId, month, year and platformSales are required");
    }
    const book = await Book_model_default.findOne({ bookId });
    if (!book) throw new ApiError_default(404, "Book not found");
    if (book.status !== "published") throw new ApiError_default(400, "Book must be published to record selling data");
    let totalSellingUnits = 0;
    let totalRevenue = 0;
    const computedPlatformSales = platformSales.map((ps) => {
      const units = Number(ps.sellingUnits) || 0;
      const price = Number(ps.sellingPricePerUnit) || 0;
      const rev = units * price;
      totalSellingUnits += units;
      totalRevenue += rev;
      return { platform: ps.platform, sellingUnits: units, sellingPricePerUnit: price, totalRevenue: rev };
    });
    const costPer = Number(costPerBook) || 0;
    const adsPer = Number(adsCostPerUnit) || 0;
    const fees = Number(platformFees) || 0;
    const returns = Number(returnsExchangeAmount) || 0;
    const outstanding = Number(outstandingAmount) || 0;
    const productionCost = totalSellingUnits * costPer;
    const grossMargin = totalRevenue - productionCost;
    const adsCost = totalSellingUnits * adsPer;
    const netProfit = grossMargin - adsCost - fees - returns - outstanding;
    const royaltyPct = book.royaltyPercentage || 70;
    const authorRoyalty = Math.max(0, netProfit * (royaltyPct / 100));
    const count = await SellingRecord_model_default.countDocuments();
    const sellingRecord = await SellingRecord_model_default.create({
      sellingRecordId: genId("SLR", count),
      bookId,
      authorId: book.authorId,
      month: Number(month),
      year: Number(year),
      platformSales: computedPlatformSales,
      costPerBook: costPer,
      adsCostPerUnit: adsPer,
      platformFees: fees,
      returnsExchangeAmount: returns,
      outstandingAmount: outstanding,
      totalSellingUnits,
      totalRevenue,
      productionCost,
      grossMargin,
      adsCost,
      netProfit,
      authorRoyalty,
      royaltyPercentage: royaltyPct,
      createdBy: adminUserId
    });
    book.totalSellingUnits += totalSellingUnits;
    book.totalRevenue += totalRevenue;
    for (const ps of computedPlatformSales) {
      const existing = book.platformWiseSales.get(ps.platform) || { sellingUnits: 0 };
      book.platformWiseSales.set(ps.platform, {
        sellingUnits: (existing.sellingUnits || 0) + ps.sellingUnits,
        productLink: existing.productLink,
        rating: existing.rating
      });
    }
    await book.save();
    const existingRoyaltyRecord = await RoyaltyRecord_model_default.findOne({
      bookId,
      month: Number(month),
      year: Number(year),
      status: "pending"
      // only look for unpaid records to accumulate into
    });
    let royaltyRecord;
    if (existingRoyaltyRecord) {
      existingRoyaltyRecord.authorRoyalty += authorRoyalty;
      existingRoyaltyRecord.finalRoyalty = Math.max(
        0,
        existingRoyaltyRecord.authorRoyalty - existingRoyaltyRecord.referralDeduction - existingRoyaltyRecord.outstandingDeduction
      );
      await existingRoyaltyRecord.save();
      royaltyRecord = existingRoyaltyRecord;
    } else {
      const rCount = await RoyaltyRecord_model_default.countDocuments();
      royaltyRecord = await RoyaltyRecord_model_default.create({
        royaltyRecordId: genId("RYR", rCount),
        authorId: book.authorId,
        bookId,
        sellingRecordId: sellingRecord.sellingRecordId,
        month: Number(month),
        year: Number(year),
        authorRoyalty,
        referralDeduction: 0,
        outstandingDeduction: 0,
        finalRoyalty: authorRoyalty,
        status: "pending"
      });
    }
    await AuditLog_model_default.create({
      userId: adminUserId,
      action: "create",
      resource: "SellingRecord",
      resourceId: sellingRecord.sellingRecordId,
      details: { bookId, month, year, totalRevenue, netProfit, authorRoyalty }
    });
    res.status(201).json({
      success: true,
      message: "Selling data submitted successfully",
      data: {
        sellingRecord,
        royaltyRecord,
        financials: {
          totalSellingUnits,
          totalRevenue,
          productionCost,
          grossMargin,
          adsCost,
          platformFees: fees,
          returnsExchangeAmount: returns,
          outstandingAmount: outstanding,
          netProfit,
          royaltyPercentage: royaltyPct,
          authorRoyalty
        }
      }
    });
  }
);
var getAllSellingRecords = asyncHandler(
  async (req, res, _next) => {
    const { page = 1, limit = 20, bookId, search } = req.query;
    const filter = {};
    if (bookId) filter.bookId = bookId;
    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      SellingRecord_model_default.find(filter).sort({ year: -1, month: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      SellingRecord_model_default.countDocuments(filter)
    ]);
    const bookIds = [...new Set(records.map((r) => r.bookId))];
    const books = await Book_model_default.find({ bookId: { $in: bookIds } }).select("bookId bookName authorId").lean();
    const authorIds = [...new Set(books.map((b) => b.authorId))];
    const authors = await Author_model_default.find({ authorId: { $in: authorIds } }).select("authorId userId").lean();
    const userIds = authors.map((a) => a.userId);
    const users = await User_model_default.find({ userId: { $in: userIds } }).select("userId firstName lastName").lean();
    const bookMap = new Map(books.map((b) => [b.bookId, b]));
    const authorMap = new Map(authors.map((a) => [a.authorId, a]));
    const userMap = new Map(users.map((u) => [u.userId, u]));
    let enriched = records.map((r) => {
      const book = bookMap.get(r.bookId);
      const author = book ? authorMap.get(book.authorId) : null;
      const user = author ? userMap.get(author.userId) : null;
      return {
        ...r,
        bookName: book?.bookName || r.bookId,
        authorName: user ? `${user.firstName} ${user.lastName}`.trim() : book?.authorId || ""
      };
    });
    if (search) {
      const s = search.toLowerCase();
      enriched = enriched.filter(
        (r) => r.bookId.toLowerCase().includes(s) || r.bookName.toLowerCase().includes(s) || r.authorName.toLowerCase().includes(s)
      );
    }
    res.status(200).json({
      success: true,
      data: {
        records: enriched,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
      }
    });
  }
);
var getSellingHistory = asyncHandler(
  async (req, res, _next) => {
    const { bookId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const book = await Book_model_default.findOne({ bookId });
    if (!book) throw new ApiError_default(404, "Book not found");
    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      SellingRecord_model_default.find({ bookId }).sort({ year: -1, month: -1 }).skip(skip).limit(Number(limit)),
      SellingRecord_model_default.countDocuments({ bookId })
    ]);
    res.status(200).json({
      success: true,
      data: {
        book: { bookId: book.bookId, bookName: book.bookName, authorId: book.authorId, royaltyPercentage: book.royaltyPercentage },
        records,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
      }
    });
  }
);
var releaseRoyaltyPayment = asyncHandler(
  async (req, res, _next) => {
    const adminUserId = req.user?.userId;
    if (!adminUserId) throw new ApiError_default(401, "Unauthorized");
    const {
      royaltyRecordId,
      bankAccountId,
      paymentMode,
      transactionReference,
      referralDeduction,
      outstandingDeduction
    } = req.body;
    if (!royaltyRecordId || !bankAccountId || !paymentMode) {
      throw new ApiError_default(400, "royaltyRecordId, bankAccountId and paymentMode are required");
    }
    const royaltyRecord = await RoyaltyRecord_model_default.findOne({ royaltyRecordId });
    if (!royaltyRecord) throw new ApiError_default(404, "Royalty record not found");
    if (royaltyRecord.status === "paid") throw new ApiError_default(400, "Royalty already paid");
    const bankAccount = await BankAccount_model_default.findOne({ _id: bankAccountId, authorId: royaltyRecord.authorId });
    if (!bankAccount) throw new ApiError_default(404, "Bank account not found");
    let paymentProofUrl;
    if (req.file) {
      paymentProofUrl = await UploadService.uploadToCloudinary(req.file.path, "povital/royalties/payment-proofs");
    }
    const refDed = Number(referralDeduction) || royaltyRecord.referralDeduction || 0;
    const outDed = Number(outstandingDeduction) || royaltyRecord.outstandingDeduction || 0;
    const finalRoyalty = Math.max(0, royaltyRecord.authorRoyalty - refDed - outDed);
    const txCount = await Transaction_model_default.countDocuments();
    const transactionId = genId("TXN", txCount);
    await Transaction_model_default.create({
      transactionId,
      authorId: royaltyRecord.authorId,
      bookId: royaltyRecord.bookId,
      type: "royalty_payment",
      amount: finalRoyalty,
      status: "completed",
      description: `Royalty payment for ${royaltyRecord.bookId} \u2014 ${getMonthName(royaltyRecord.month)} ${royaltyRecord.year}`,
      paymentMethod: "bank_transfer",
      bankAccountId,
      paymentProof: paymentProofUrl,
      paymentDate: /* @__PURE__ */ new Date(),
      metadata: {
        royaltyRecordId,
        sellingRecordId: royaltyRecord.sellingRecordId,
        month: royaltyRecord.month,
        year: royaltyRecord.year,
        authorRoyalty: royaltyRecord.authorRoyalty,
        referralDeduction: refDed,
        outstandingDeduction: outDed
      },
      createdBy: adminUserId
    });
    royaltyRecord.status = "paid";
    royaltyRecord.bankAccountId = bankAccountId;
    royaltyRecord.paymentProof = paymentProofUrl;
    royaltyRecord.paymentMode = paymentMode;
    royaltyRecord.transactionReference = transactionReference;
    royaltyRecord.paymentDate = /* @__PURE__ */ new Date();
    royaltyRecord.paidBy = adminUserId;
    royaltyRecord.transactionId = transactionId;
    royaltyRecord.referralDeduction = refDed;
    royaltyRecord.outstandingDeduction = outDed;
    royaltyRecord.finalRoyalty = finalRoyalty;
    await royaltyRecord.save();
    const author = await Author_model_default.findOne({ authorId: royaltyRecord.authorId });
    if (author) {
      author.totalEarnings += finalRoyalty;
      await author.save();
    }
    await AuditLog_model_default.create({
      userId: adminUserId,
      action: "payment",
      resource: "RoyaltyRecord",
      resourceId: royaltyRecordId,
      details: { authorId: royaltyRecord.authorId, bookId: royaltyRecord.bookId, finalRoyalty, transactionId }
    });
    res.status(200).json({
      success: true,
      message: "Royalty payment released successfully",
      data: { royaltyRecord, transactionId }
    });
  }
);
var getAdminRoyaltyListing = asyncHandler(
  async (req, res, _next) => {
    const { page = 1, limit = 20, search, status, authorId, fromDate, toDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (authorId) filter.authorId = authorId;
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const authorSummary = await RoyaltyRecord_model_default.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$authorId",
          totalRoyalty: { $sum: "$finalRoyalty" },
          totalPaid: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$finalRoyalty", 0] } },
          totalPending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$finalRoyalty", 0] } },
          lastPaymentDate: { $max: "$paymentDate" },
          lastRoyaltyAmount: { $last: "$finalRoyalty" },
          pendingCount: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] } }
        }
      },
      { $sort: { totalRoyalty: -1 } },
      { $skip: skip },
      { $limit: Number(limit) }
    ]);
    const total = (await RoyaltyRecord_model_default.distinct("authorId", filter)).length;
    const authorIds = authorSummary.map((a) => a._id);
    const [authors, books] = await Promise.all([
      Author_model_default.find({ authorId: { $in: authorIds } }).select("authorId userId totalBooks totalSoldUnits address").lean(),
      Book_model_default.find({ authorId: { $in: authorIds }, status: "published" }).select("authorId totalSellingUnits").lean()
    ]);
    const userIds = authors.map((a) => a.userId);
    const users = await User_model_default.find({ userId: { $in: userIds } }).select("userId firstName lastName").lean();
    let result = authorSummary.map((summary) => {
      const author = authors.find((a) => a.authorId === summary._id);
      const user = author ? users.find((u) => u.userId === author.userId) : null;
      const authorBooks = books.filter((b) => b.authorId === summary._id);
      const totalBookUnits = authorBooks.reduce((s, b) => s + (b.totalSellingUnits || 0), 0);
      return {
        authorId: summary._id,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        location: author ? [author.address?.city, author.address?.state].filter(Boolean).join(", ") : "",
        totalBooks: author?.totalBooks || 0,
        totalBookUnits,
        lastRoyalty: summary.lastRoyaltyAmount || 0,
        lastPaymentDate: summary.lastPaymentDate || null,
        netRoyalty: summary.totalRoyalty || 0,
        totalPaid: summary.totalPaid || 0,
        totalPending: summary.totalPending || 0,
        pendingCount: summary.pendingCount,
        paidCount: summary.paidCount
      };
    });
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) => r.authorId.toLowerCase().includes(s) || `${r.firstName} ${r.lastName}`.toLowerCase().includes(s)
      );
    }
    res.status(200).json({
      success: true,
      data: {
        authors: result,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
      }
    });
  }
);
var getAuthorRoyaltyDetail = asyncHandler(
  async (req, res, _next) => {
    const { authorId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const author = await Author_model_default.findOne({ authorId });
    if (!author) throw new ApiError_default(404, "Author not found");
    const user = await User_model_default.findOne({ userId: author.userId }).select("firstName lastName email").lean();
    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      RoyaltyRecord_model_default.find({ authorId }).sort({ year: -1, month: -1 }).skip(skip).limit(Number(limit)).lean(),
      RoyaltyRecord_model_default.countDocuments({ authorId })
    ]);
    const bookIds = [...new Set(records.map((r) => r.bookId))];
    const books = await Book_model_default.find({ bookId: { $in: bookIds } }).select("bookId bookName").lean();
    const enriched = records.map((r) => {
      const book = books.find((b) => b.bookId === r.bookId);
      return { ...r, bookName: book?.bookName || r.bookId };
    });
    res.status(200).json({
      success: true,
      data: {
        author: {
          authorId,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          totalEarnings: author.totalEarnings,
          totalBooks: author.totalBooks
        },
        records: enriched,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
      }
    });
  }
);
var getMyRoyalties = asyncHandler(
  async (req, res, _next) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError_default(401, "Unauthorized");
    const author = await Author_model_default.findOne({ userId });
    if (!author) throw new ApiError_default(404, "Author not found");
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const monthlyGroups = await RoyaltyRecord_model_default.aggregate([
      { $match: { authorId: author.authorId } },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalFinalRoyalty: { $sum: "$finalRoyalty" },
          totalSellingUnits: { $sum: 0 },
          status: { $first: "$status" },
          paymentDate: { $first: "$paymentDate" },
          records: { $push: "$$ROOT" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $skip: skip },
      { $limit: Number(limit) }
    ]);
    const monthYearPairs = monthlyGroups.map((g) => ({ month: g._id.month, year: g._id.year }));
    const [sellingUnitsByMonth, totalResult, totalSoldUnitsAgg] = await Promise.all([
      SellingRecord_model_default.aggregate([
        {
          $match: {
            authorId: author.authorId,
            ...monthYearPairs.length > 0 ? { $or: monthYearPairs.map((p) => ({ month: p.month, year: p.year })) } : { month: -1 }
          }
        },
        { $group: { _id: { month: "$month", year: "$year" }, totalUnits: { $sum: "$totalSellingUnits" } } }
      ]),
      RoyaltyRecord_model_default.aggregate([
        { $match: { authorId: author.authorId } },
        { $group: { _id: { month: "$month", year: "$year" } } },
        { $count: "total" }
      ]),
      // Aggregate total selling units from Books (source of truth)
      Book_model_default.aggregate([
        { $match: { authorId: author.authorId } },
        { $group: { _id: null, total: { $sum: "$totalSellingUnits" } } }
      ])
    ]);
    const unitsByMonthMap = new Map(
      sellingUnitsByMonth.map((s) => [`${s._id.year}-${s._id.month}`, s.totalUnits])
    );
    const enriched = monthlyGroups.map((g) => ({
      month: g._id.month,
      year: g._id.year,
      sellingUnits: unitsByMonthMap.get(`${g._id.year}-${g._id.month}`) || 0,
      netRoyalty: g.totalFinalRoyalty,
      paymentDate: g.paymentDate,
      status: g.records.some((r) => r.status === "pending") ? "pending" : "paid",
      recordCount: g.records.length
    }));
    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEarnings: author.totalEarnings,
          totalSoldUnits: totalSoldUnitsAgg[0]?.total || 0
        },
        months: enriched,
        pagination: {
          total: totalResult[0]?.total || 0,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil((totalResult[0]?.total || 0) / Number(limit))
        }
      }
    });
  }
);
var getMyRoyaltyMonthDetail = asyncHandler(
  async (req, res, _next) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError_default(401, "Unauthorized");
    const author = await Author_model_default.findOne({ userId });
    if (!author) throw new ApiError_default(404, "Author not found");
    const { month, year } = req.params;
    const royaltyRecords = await RoyaltyRecord_model_default.find({
      authorId: author.authorId,
      month: Number(month),
      year: Number(year)
    }).lean();
    if (royaltyRecords.length === 0) throw new ApiError_default(404, "No royalty data found for this period");
    const bookIds = royaltyRecords.map((r) => r.bookId);
    const [sellingRecords, books] = await Promise.all([
      SellingRecord_model_default.find({ authorId: author.authorId, month: Number(month), year: Number(year) }).lean(),
      Book_model_default.find({ bookId: { $in: bookIds } }).select("bookId bookName subtitle coverPage actualLaunchDate").lean()
    ]);
    const perBook = royaltyRecords.map((rr) => {
      const book = books.find((b) => b.bookId === rr.bookId);
      const sr = sellingRecords.find((s) => s.bookId === rr.bookId);
      return {
        bookId: rr.bookId,
        bookName: book?.bookName || rr.bookId,
        subtitle: book?.subtitle,
        coverPage: book?.coverPage,
        publishedDate: book?.actualLaunchDate,
        netSellingUnits: sr?.totalSellingUnits || 0,
        totalRevenue: sr?.totalRevenue || 0,
        netProfit: sr?.netProfit || 0,
        authorRoyalty: rr.authorRoyalty,
        finalRoyalty: rr.finalRoyalty,
        status: rr.status,
        paymentDate: rr.paymentDate,
        paymentMode: rr.paymentMode,
        transactionReference: rr.transactionReference,
        paymentProof: rr.paymentProof,
        platformSales: sr?.platformSales || []
      };
    });
    const totals = {
      month: Number(month),
      year: Number(year),
      totalNetRoyalty: royaltyRecords.reduce((s, r) => s + r.finalRoyalty, 0),
      totalSellingUnits: sellingRecords.reduce((s, r) => s + r.totalSellingUnits, 0),
      status: royaltyRecords.some((r) => r.status === "pending") ? "pending" : "paid",
      paymentDate: royaltyRecords.find((r) => r.status === "paid")?.paymentDate,
      paymentMode: royaltyRecords.find((r) => r.status === "paid")?.paymentMode,
      transactionReference: royaltyRecords.find((r) => r.status === "paid")?.transactionReference,
      paymentProof: royaltyRecords.find((r) => r.status === "paid")?.paymentProof
    };
    res.status(200).json({
      success: true,
      data: { totals, books: perBook }
    });
  }
);
var getBookRoyaltyRecords = asyncHandler(
  async (req, res, _next) => {
    const { bookId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const book = await Book_model_default.findOne({ bookId });
    if (!book) throw new ApiError_default(404, "Book not found");
    const skip = (Number(page) - 1) * Number(limit);
    const [records, total] = await Promise.all([
      RoyaltyRecord_model_default.find({ bookId }).sort({ year: -1, month: -1 }).skip(skip).limit(Number(limit)).lean(),
      RoyaltyRecord_model_default.countDocuments({ bookId })
    ]);
    res.status(200).json({
      success: true,
      data: {
        book: { bookId: book.bookId, bookName: book.bookName, authorId: book.authorId },
        records,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
      }
    });
  }
);
var previewFinancials = asyncHandler(
  async (req, res, _next) => {
    const {
      bookId,
      platformSales,
      costPerBook,
      adsCostPerUnit,
      platformFees,
      returnsExchangeAmount,
      outstandingAmount
    } = req.body;
    if (!bookId || !Array.isArray(platformSales)) {
      throw new ApiError_default(400, "bookId and platformSales are required");
    }
    const book = await Book_model_default.findOne({ bookId });
    if (!book) throw new ApiError_default(404, "Book not found");
    let totalSellingUnits = 0;
    let totalRevenue = 0;
    const computed = platformSales.map((ps) => {
      const units = Number(ps.sellingUnits) || 0;
      const price = Number(ps.sellingPricePerUnit) || 0;
      const rev = units * price;
      totalSellingUnits += units;
      totalRevenue += rev;
      return { platform: ps.platform, sellingUnits: units, sellingPricePerUnit: price, totalRevenue: rev };
    });
    const costPer = Number(costPerBook) || 0;
    const adsPer = Number(adsCostPerUnit) || 0;
    const fees = Number(platformFees) || 0;
    const returns = Number(returnsExchangeAmount) || 0;
    const outstanding = Number(outstandingAmount) || 0;
    const productionCost = totalSellingUnits * costPer;
    const grossMargin = totalRevenue - productionCost;
    const adsCost = totalSellingUnits * adsPer;
    const netProfit = grossMargin - adsCost - fees - returns - outstanding;
    const royaltyPct = book.royaltyPercentage || 70;
    const authorRoyalty = Math.max(0, netProfit * (royaltyPct / 100));
    res.status(200).json({
      success: true,
      data: {
        platformBreakdown: computed,
        financials: {
          totalSellingUnits,
          totalRevenue,
          productionCost,
          grossMargin,
          adsCost,
          platformFees: fees,
          returnsExchangeAmount: returns,
          outstandingAmount: outstanding,
          netProfit,
          royaltyPercentage: royaltyPct,
          authorRoyalty
        }
      }
    });
  }
);
function getMonthName(month) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month - 1] || month.toString();
}

// src/routes/selling.routes.ts
var router14 = (0, import_express14.Router)();
router14.get("/author/royalties", verifyToken, checkRole("author"), getMyRoyalties);
router14.get("/author/royalties/:year/:month", verifyToken, checkRole("author"), getMyRoyaltyMonthDetail);
var adminAuth = [verifyToken, checkRole("super_admin", "sub_admin")];
router14.post("/admin/selling", ...adminAuth, submitSellingData);
router14.get("/admin/selling", ...adminAuth, getAllSellingRecords);
router14.post("/admin/selling/preview", ...adminAuth, previewFinancials);
router14.get("/admin/selling/:bookId", ...adminAuth, getSellingHistory);
router14.get("/admin/royalties", ...adminAuth, getAdminRoyaltyListing);
router14.get("/admin/royalties/author/:authorId", ...adminAuth, getAuthorRoyaltyDetail);
router14.get("/admin/royalties/book/:bookId", ...adminAuth, getBookRoyaltyRecords);
router14.post("/admin/royalties/release", ...adminAuth, uploadSingle("paymentProof"), releaseRoyaltyPayment);
var selling_routes_default = router14;

// src/routes/public.routes.ts
var import_express15 = require("express");

// src/controllers/public.controller.ts
var getPublicAuthors = asyncHandler(
  async (req, res, _next) => {
    const {
      page = 1,
      limit = 20,
      search,
      language
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { isRestricted: false };
    const publishedAuthorIds = await Book_model_default.distinct("authorId", { status: "published" });
    filter.authorId = { $in: publishedAuthorIds };
    let userFilter = {};
    if (search) {
      const s = search.toLowerCase();
      userFilter.$or = [
        { firstName: new RegExp(s, "i") },
        { lastName: new RegExp(s, "i") }
      ];
    }
    const [authors] = await Promise.all([
      Author_model_default.find(filter).sort({ totalEarnings: -1 }).skip(skip).limit(Number(limit)).lean(),
      Author_model_default.countDocuments(filter)
    ]);
    const userIds = authors.map((a) => a.userId);
    const users = await User_model_default.find({ userId: { $in: userIds }, ...userFilter }).select("userId firstName lastName").lean();
    const matchedUserIds = new Set(users.map((u) => u.userId));
    const filteredAuthors = search ? authors.filter((a) => matchedUserIds.has(a.userId)) : authors;
    const authorIds = filteredAuthors.map((a) => a.authorId);
    const bookCounts = await Book_model_default.aggregate([
      { $match: { authorId: { $in: authorIds }, status: "published" } },
      { $group: { _id: "$authorId", count: { $sum: 1 }, languages: { $addToSet: "$language" } } }
    ]);
    let result = filteredAuthors.map((author) => {
      const user = users.find((u) => u.userId === author.userId);
      const bookInfo = bookCounts.find((b) => b._id === author.authorId);
      return {
        authorId: author.authorId,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        profilePicture: author.profilePicture,
        location: [author.address?.city, author.address?.state].filter(Boolean).join(", "),
        booksPublished: bookInfo?.count || 0,
        languages: bookInfo?.languages || [],
        totalSoldUnits: author.totalSoldUnits || 0,
        totalEarnings: author.totalEarnings || 0
      };
    });
    if (language) {
      result = result.filter((a) => a.languages.includes(language));
    }
    res.status(200).json({
      success: true,
      data: {
        authors: result,
        pagination: {
          total: result.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(result.length / Number(limit))
        }
      }
    });
  }
);
var getPublicAuthorDetail = asyncHandler(
  async (req, res, _next) => {
    const { authorId } = req.params;
    const author = await Author_model_default.findOne({ authorId, isRestricted: false }).lean();
    if (!author) throw new ApiError_default(404, "Author not found");
    const user = await User_model_default.findOne({ userId: author.userId }).select("firstName lastName").lean();
    const books = await Book_model_default.find({ authorId, status: "published" }).select("bookId bookName subtitle coverPage language bookType actualLaunchDate totalSellingUnits marketplaces royaltyPercentage").lean();
    const reviews = await Review_model_default.find({ authorId, isVisible: true }).sort({ createdAt: -1 }).limit(5).lean();
    const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
    res.status(200).json({
      success: true,
      data: {
        author: {
          authorId,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          profilePicture: author.profilePicture,
          location: [author.address?.city, author.address?.state].filter(Boolean).join(", "),
          totalBooks: author.totalBooks,
          totalSoldUnits: author.totalSoldUnits,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length
        },
        books,
        recentReviews: reviews
      }
    });
  }
);
var getPublicBooks = asyncHandler(
  async (req, res, _next) => {
    const {
      page = 1,
      limit = 20,
      search,
      authorName,
      bookType,
      language,
      authorId
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { status: "published" };
    if (bookType) filter.bookType = bookType;
    if (language) filter.language = language;
    if (authorId) filter.authorId = authorId;
    if (search) {
      filter.$or = [
        { bookName: new RegExp(search, "i") },
        { subtitle: new RegExp(search, "i") }
      ];
    }
    if (authorName) {
      const matchedUsers = await User_model_default.find({
        $or: [
          { firstName: new RegExp(authorName, "i") },
          { lastName: new RegExp(authorName, "i") }
        ]
      }).select("userId").lean();
      const userIds = matchedUsers.map((u) => u.userId);
      const matchedAuthors = await Author_model_default.find({ userId: { $in: userIds } }).select("authorId").lean();
      filter.authorId = { $in: matchedAuthors.map((a) => a.authorId) };
    }
    const [books, total] = await Promise.all([
      Book_model_default.find(filter).select("bookId authorId bookName subtitle coverPage language bookType actualLaunchDate totalSellingUnits marketplaces platformWiseSales priceBreakdown").sort({ actualLaunchDate: -1 }).skip(skip).limit(Number(limit)).lean(),
      Book_model_default.countDocuments(filter)
    ]);
    const authorIds = books.map((b) => b.authorId);
    const authors = await Author_model_default.find({ authorId: { $in: authorIds } }).select("authorId userId").lean();
    const userIds2 = authors.map((a) => a.userId);
    const users = await User_model_default.find({ userId: { $in: userIds2 } }).select("userId firstName lastName").lean();
    const enriched = books.map((book) => {
      const author = authors.find((a) => a.authorId === book.authorId);
      const user = author ? users.find((u) => u.userId === author.userId) : null;
      return {
        bookId: book.bookId,
        bookName: book.bookName,
        subtitle: book.subtitle,
        coverPage: book.coverPage,
        language: book.language,
        bookType: book.bookType,
        actualLaunchDate: book.actualLaunchDate,
        totalSellingUnits: book.totalSellingUnits,
        marketplaces: book.marketplaces,
        sellingPrice: book.priceBreakdown?.finalAmount || 0,
        authorId: book.authorId,
        authorName: user ? `${user.firstName} ${user.lastName}`.trim() : ""
      };
    });
    res.status(200).json({
      success: true,
      data: {
        books: enriched,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) }
      }
    });
  }
);
var getPublicBookDetail = asyncHandler(
  async (req, res, _next) => {
    const { bookId } = req.params;
    const book = await Book_model_default.findOne({ bookId, status: "published" }).lean();
    if (!book) throw new ApiError_default(404, "Book not found");
    const author = await Author_model_default.findOne({ authorId: book.authorId }).lean();
    const user = author ? await User_model_default.findOne({ userId: author.userId }).select("firstName lastName").lean() : null;
    const platformSales = {};
    if (book.platformWiseSales && book.platformWiseSales instanceof Map) {
      book.platformWiseSales.forEach((v, k) => {
        platformSales[k] = v;
      });
    } else if (book.platformWiseSales) {
      Object.assign(platformSales, book.platformWiseSales);
    }
    res.status(200).json({
      success: true,
      data: {
        book: {
          bookId: book.bookId,
          bookName: book.bookName,
          subtitle: book.subtitle,
          coverPage: book.coverPage,
          language: book.language,
          bookType: book.bookType,
          targetAudience: book.targetAudience,
          actualLaunchDate: book.actualLaunchDate,
          totalSellingUnits: book.totalSellingUnits,
          marketplaces: book.marketplaces,
          platformWiseSales: platformSales,
          sellingPrice: book.priceBreakdown?.finalAmount || 0
        },
        author: {
          authorId: book.authorId,
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          profilePicture: author?.profilePicture,
          location: author ? [author.address?.city, author.address?.state].filter(Boolean).join(", ") : ""
        }
      }
    });
  }
);

// src/models/CalculatorConfig.model.ts
var import_mongoose17 = __toESM(require("mongoose"));
var PaperConfigSchema = new import_mongoose17.Schema(
  {
    paperName: { type: String, required: true, trim: true },
    paperSize: { type: String, required: true, trim: true },
    pricePerPage: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);
var CalculatorConfigSchema = new import_mongoose17.Schema(
  {
    paperConfigs: {
      type: [PaperConfigSchema],
      default: []
    },
    mspPercent: { type: Number, required: true, min: 0, default: 50 },
    mrpPercent: { type: Number, required: true, min: 0, default: 40 },
    royaltyFromMrpPercent: { type: Number, required: true, min: 0, default: 30 },
    offlineExpensesPercent: { type: Number, required: true, min: 0, default: 15 },
    onlineExpensesPercent: { type: Number, required: true, min: 0, default: 10 },
    ebookRoyaltyPercent: { type: Number, required: true, min: 0, default: 35 },
    ebookOnlineExpensesPercent: { type: Number, required: true, min: 0, default: 10 },
    magazineRoyaltyOverride: { type: Number, default: null },
    updatedBy: { type: String, default: "" }
  },
  { timestamps: true }
);
var CalculatorConfig_model_default = import_mongoose17.default.model("CalculatorConfig", CalculatorConfigSchema);

// src/controllers/calculator.controller.ts
var CalculatorController = class {
  static {
    // Public — no auth required
    this.getPublicConfig = asyncHandler(
      async (_req, res, _next) => {
        const config2 = await CalculatorConfig_model_default.findOne().sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: { config: config2 } });
      }
    );
  }
  static {
    // Admin — get current config for editing
    this.getAdminConfig = asyncHandler(
      async (_req, res, _next) => {
        const config2 = await CalculatorConfig_model_default.findOne().sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: { config: config2 } });
      }
    );
  }
  static {
    // Admin — upsert full config
    this.saveConfig = asyncHandler(
      async (req, res, _next) => {
        const {
          paperConfigs,
          mspPercent,
          mrpPercent,
          royaltyFromMrpPercent,
          offlineExpensesPercent,
          onlineExpensesPercent,
          ebookRoyaltyPercent,
          ebookOnlineExpensesPercent,
          magazineRoyaltyOverride
        } = req.body;
        if (!paperConfigs || !Array.isArray(paperConfigs) || paperConfigs.length === 0) {
          throw new ApiError_default(400, "At least one paper configuration is required");
        }
        const numericFields = {
          mspPercent,
          mrpPercent,
          royaltyFromMrpPercent,
          offlineExpensesPercent,
          onlineExpensesPercent,
          ebookRoyaltyPercent,
          ebookOnlineExpensesPercent
        };
        for (const [field, value] of Object.entries(numericFields)) {
          if (value === void 0 || value === null || isNaN(Number(value))) {
            throw new ApiError_default(400, `${field} is required and must be a number`);
          }
        }
        const adminId = req.user?.userId || "unknown";
        const payload = {
          paperConfigs: paperConfigs.map((p) => ({
            paperName: String(p.paperName).trim(),
            paperSize: String(p.paperSize).trim(),
            pricePerPage: Number(p.pricePerPage)
          })),
          mspPercent: Number(mspPercent),
          mrpPercent: Number(mrpPercent),
          royaltyFromMrpPercent: Number(royaltyFromMrpPercent),
          offlineExpensesPercent: Number(offlineExpensesPercent),
          onlineExpensesPercent: Number(onlineExpensesPercent),
          ebookRoyaltyPercent: Number(ebookRoyaltyPercent),
          ebookOnlineExpensesPercent: Number(ebookOnlineExpensesPercent),
          magazineRoyaltyOverride: magazineRoyaltyOverride !== void 0 && magazineRoyaltyOverride !== "" ? Number(magazineRoyaltyOverride) : null,
          updatedBy: adminId
        };
        const existing = await CalculatorConfig_model_default.findOne();
        let config2;
        if (existing) {
          config2 = await CalculatorConfig_model_default.findByIdAndUpdate(existing._id, payload, { new: true });
        } else {
          config2 = await CalculatorConfig_model_default.create(payload);
        }
        res.status(200).json({
          success: true,
          message: "Calculator configuration saved successfully",
          data: { config: config2 }
        });
      }
    );
  }
};

// src/routes/public.routes.ts
var router15 = (0, import_express15.Router)();
router15.get("/authors", getPublicAuthors);
router15.get("/authors/:authorId", getPublicAuthorDetail);
router15.get("/books", getPublicBooks);
router15.get("/books/:bookId", getPublicBookDetail);
router15.get("/calculator-config", CalculatorController.getPublicConfig);
var public_routes_default = router15;

// src/routes/calculator.routes.ts
var import_express16 = require("express");
var router16 = (0, import_express16.Router)();
router16.get("/public", CalculatorController.getPublicConfig);
router16.use(verifyToken);
router16.use(checkRole("super_admin", "sub_admin"));
router16.get("/", CalculatorController.getAdminConfig);
router16.put("/", CalculatorController.saveConfig);
var calculator_routes_default = router16;

// src/app.ts
var app = (0, import_express17.default)();
app.use((0, import_helmet.default)());
app.use(
  (0, import_cors.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(import_express17.default.json({ limit: "10mb" }));
app.use(import_express17.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, import_cookie_parser.default)());
if (process.env.NODE_ENV === "development") {
  app.use((0, import_morgan.default)("dev"));
} else {
  app.use((0, import_morgan.default)("combined"));
}
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use((_req, res, next) => {
  db_default().then(() => next()).catch(() => {
    res.status(503).json({ success: false, message: "Database connection failed" });
  });
});
app.get("/api/cron/payment-reminders", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  try {
    await CronService.checkPayLaterReminders();
    res.status(200).json({ success: true, message: "Payment reminders processed" });
  } catch {
    res.status(500).json({ success: false, message: "Cron job failed" });
  }
});
app.use("/api/auth", auth_routes_default);
app.use("/api/admin/auth", admin_auth_routes_default);
app.use("/api/author/auth", author_auth_routes_default);
app.use("/api/admin", admin_routes_default);
app.use("/api/author", author_routes_default);
app.use("/api/books", book_routes_default);
app.use("/api/financial", financial_routes_default);
app.use("/api/support", support_routes_default);
app.use("/api/referrals", referral_routes_default);
app.use("/api/utility", utility_routes_default);
app.use("/api/payment-config", payment_config_routes_default);
app.use("/api/admin/payment-config", payment_config_routes_default);
app.use("/api/reviews", review_routes_default);
app.use("/api/payment", payment_routes_default);
app.use("/api", selling_routes_default);
app.use("/api/public", public_routes_default);
app.use("/api/calculator", calculator_routes_default);
app.use("/api/admin/calculator", calculator_routes_default);
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to POVITAL Author Platform API",
    version: "1.0.0",
    documentation: "/api/docs"
  });
});
app.use(notFound);
app.use(errorHandler);
var app_default = app;

// api/index.ts
var config = {
  maxDuration: 60
};
var api_default = app_default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  config
});
