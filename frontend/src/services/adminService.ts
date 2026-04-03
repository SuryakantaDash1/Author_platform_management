import axiosInstance from '../api/interceptors';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse, PaginationParams } from '../types/common.types';

export const adminService = {
  // Author Management
  createAuthor: async (data: any): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.ADMIN.CREATE_AUTHOR, data);
    return response.data;
  },

  getAllAuthors: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_AUTHORS, { params });
    return response.data;
  },

  getAuthorDetails: async (authorId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_AUTHOR_DETAILS(authorId));
    return response.data;
  },

  updateAuthorTier: async (authorId: string, tier: string): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.UPDATE_AUTHOR_TIER(authorId), {
      tier,
    });
    return response.data;
  },

  restrictAuthor: async (
    authorId: string,
    isRestricted: boolean,
    restrictionReason?: string
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.RESTRICT_AUTHOR(authorId), {
      isRestricted,
      restrictionReason,
    });
    return response.data;
  },

  // Book Management
  getAllBooks: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_BOOKS, { params });
    return response.data;
  },

  updateBookStatus: async (
    bookId: string,
    status: string,
    rejectionReason?: string
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.UPDATE_BOOK_STATUS(bookId), {
      status,
      rejectionReason,
    });
    return response.data;
  },

  // Support Tickets
  getAllTickets: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_ALL_TICKETS, { params });
    return response.data;
  },

  // Platform Statistics
  getPlatformStats: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_PLATFORM_STATS);
    return response.data;
  },

  // Pricing Configuration
  updatePricing: async (data: any): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.ADMIN.UPDATE_PRICING, data);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.GET_AUDIT_LOGS, { params });
    return response.data;
  },
};
