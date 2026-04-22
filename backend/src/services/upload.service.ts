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

      const uploadOptions: any = {
        folder,
        resource_type: resourceType,
        access_mode: 'public',
        type: 'upload',
      };

      // For PDFs: add format flag so Cloudinary serves them inline
      if (ext === 'pdf') {
        uploadOptions.flags = 'attachment';
      }

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

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

  // Extract full public ID (with folder path) from a Cloudinary URL
  // e.g. https://res.cloudinary.com/cloud/raw/upload/v123/povital/books/manuscripts/abc.pdf
  //   => povital/books/manuscripts/abc
  static extractPublicIdFromUrl(url: string): { publicId: string; resourceType: 'raw' | 'image' } {
    // Determine resource type from URL path
    const resourceType: 'raw' | 'image' = url.includes('/raw/upload/') ? 'raw' : 'image';

    // Strip everything up to and including /upload/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
      // Fallback: use simple extraction
      const parts = url.split('/');
      return { publicId: parts[parts.length - 1].split('.')[0], resourceType };
    }

    let afterUpload = url.substring(uploadIndex + '/upload/'.length);

    // Remove version segment (v followed by digits)
    afterUpload = afterUpload.replace(/^v\d+\//, '');

    // Remove file extension
    const lastDot = afterUpload.lastIndexOf('.');
    const publicId = lastDot !== -1 ? afterUpload.substring(0, lastDot) : afterUpload;

    return { publicId, resourceType };
  }

  // Generate a signed delivery URL for a Cloudinary resource.
  // The account has "Delivery URL Security" enabled, so all access requires signed URLs.
  // We use sign_url:true (no expires_at — requires Advanced plan) and preserve the
  // original version number so the signed URL matches the actual CDN resource URL.
  static generateSignedUrl(cloudinaryUrl: string): string {
    const { publicId, resourceType } = UploadService.extractPublicIdFromUrl(cloudinaryUrl);

    // For raw files the public ID includes the extension — add it back
    const urlLower = cloudinaryUrl.toLowerCase();
    const ext = urlLower.endsWith('.pdf') ? 'pdf'
      : urlLower.endsWith('.docx') ? 'docx'
      : urlLower.endsWith('.doc') ? 'doc'
      : urlLower.endsWith('.png') ? 'png'
      : urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') ? 'jpg'
      : '';
    const publicIdFull = resourceType === 'raw' && ext ? `${publicId}.${ext}` : publicId;

    // Preserve original version so generated URL exactly matches the stored CDN URL
    const versionMatch = cloudinaryUrl.match(/\/upload\/(?:s--[^/]+--\/)?v(\d+)\//);
    const version = versionMatch ? parseInt(versionMatch[1]) : undefined;

    const signedUrl = cloudinary.url(publicIdFull, {
      resource_type: resourceType,
      type: 'upload',
      sign_url: true,
      secure: true,
      ...(version ? { version } : {}),
    });

    return signedUrl;
  }
}
