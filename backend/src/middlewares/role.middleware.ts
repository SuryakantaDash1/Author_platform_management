import { Request, Response, NextFunction } from 'express';
import { UserRole, AccountTier } from '../types';
import ApiError from '../utils/ApiError';

// Check if user has required role
export const checkRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Access denied. Insufficient permissions.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user has required tier
export const checkTier = (...tiers: AccountTier[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!tiers.includes(req.user.tier)) {
        throw new ApiError(403, 'This feature requires a paid subscription. Please upgrade your account.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user has required permission
export const checkPermission = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // Super admins have all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Check if user has at least one of the required permissions
      const userPermissions = req.user.permissions || [];
      const hasPermission = permissions.some((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        throw new ApiError(403, 'You do not have permission to perform this action.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Check if user owns the resource (for authors)
export const checkOwnership = (resourceIdParam: string = 'authorId') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // Admins can access all resources
      if (req.user.role === 'super_admin' || req.user.role === 'sub_admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam];

      // For authors, check if they own the resource
      if (req.user.role === 'author') {
        // User ID should match author ID for authors
        // This assumes authorId is same as userId (needs to be verified in controller)
        if (!resourceId || resourceId !== req.user.userId) {
          throw new ApiError(403, 'You can only access your own resources.');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
