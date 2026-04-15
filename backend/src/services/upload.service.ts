import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import logger from '../utils/logger';

export class UploadService {
  // Upload file to Cloudinary
  static async uploadToCloudinary(
    filePath: string,
    folder: string = 'povital'
  ): Promise<string> {
    try {
      // Use 'raw' for non-image files (PDF, DOC, etc.) so they're accessible without auth
      const ext = filePath.split('.').pop()?.toLowerCase() || '';
      const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
      const resourceType = imageExts.includes(ext) ? 'image' as const : 'raw' as const;

      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
        access_mode: 'public',
        type: 'upload',
      });

      // Delete local file after upload
      fs.unlinkSync(filePath);

      logger.info(`File uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      logger.error('Error uploading to Cloudinary:', error);
      // Delete local file even if upload fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw new Error('Failed to upload file');
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(
    filePaths: string[],
    folder: string = 'povital'
  ): Promise<string[]> {
    const uploadPromises = filePaths.map((filePath) =>
      this.uploadToCloudinary(filePath, folder)
    );

    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      logger.error('Error uploading multiple files:', error);
      throw new Error('Failed to upload files');
    }
  }

  // Delete file from Cloudinary
  static async deleteFromCloudinary(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`File deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      logger.error('Error deleting from Cloudinary:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Get Cloudinary public ID from URL
  static getPublicIdFromUrl(url: string): string {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split('.')[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
  }
}
