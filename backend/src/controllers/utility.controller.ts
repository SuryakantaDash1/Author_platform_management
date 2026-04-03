import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import https from 'https';

export class UtilityController {
  static pincodeLookup = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { pin } = req.params;

      if (!pin || !/^\d{6}$/.test(pin)) {
        throw new ApiError(400, 'Invalid PIN code. Must be exactly 6 digits.');
      }

      const data: any = await new Promise((resolve, reject) => {
        const url = `https://api.postalpincode.in/pincode/${pin}`;
        const request = https.get(url, { timeout: 8000 }, (response) => {
          let body = '';
          response.on('data', (chunk) => (body += chunk));
          response.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch {
              reject(new Error('Failed to parse PIN code API response'));
            }
          });
        });
        request.on('error', (err) => reject(err));
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('PIN code API request timed out'));
        });
      });

      if (
        !data ||
        !Array.isArray(data) ||
        data[0]?.Status !== 'Success' ||
        !data[0]?.PostOffice?.length
      ) {
        throw new ApiError(404, 'No results found for this PIN code');
      }

      const postOffice = data[0].PostOffice[0];

      res.status(200).json({
        success: true,
        data: {
          division: postOffice.Division || '',
          city: postOffice.Block || postOffice.Name || '',
          district: postOffice.District || '',
          state: postOffice.State || '',
          country: postOffice.Country || 'India',
        },
      });
    }
  );
}
