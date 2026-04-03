import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import ApiError from '../utils/ApiError';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter for allowed file types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed image types
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  // Allowed document types
  const documentTypes = /pdf|doc|docx|txt|rtf/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'profilePicture' || file.fieldname === 'coverPage') {
    // Only images for profile and cover
    if (
      imageTypes.test(extname.replace('.', '')) &&
      mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          'Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed for profile pictures and cover pages'
        )
      );
    }
  } else if (file.fieldname === 'bookFiles') {
    // Documents for book files
    if (
      documentTypes.test(extname.replace('.', '')) &&
      (mimetype.startsWith('application/') || mimetype.startsWith('text/'))
    ) {
      cb(null, true);
    } else {
      cb(
        new ApiError(
          400,
          'Only document files (PDF, DOC, DOCX, TXT, RTF) are allowed for book files'
        )
      );
    }
  } else {
    // Allow both for other fields
    if (
      (imageTypes.test(extname.replace('.', '')) &&
        mimetype.startsWith('image/')) ||
      (documentTypes.test(extname.replace('.', '')) &&
        (mimetype.startsWith('application/') || mimetype.startsWith('text/')))
    ) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'File type not allowed'));
    }
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Export upload middleware variants
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

export const uploadMultiple = (fieldName: string, maxCount: number = 10) =>
  upload.array(fieldName, maxCount);

export const uploadFields = (
  fields: Array<{ name: string; maxCount: number }>
) => upload.fields(fields);

export default upload;
