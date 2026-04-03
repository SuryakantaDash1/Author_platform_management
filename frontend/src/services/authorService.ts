import axiosInstance from '../api/interceptors';
import { API_ENDPOINTS } from '../api/endpoints';
import {
  UpdateAuthorProfileRequest,
  AddBankAccountRequest,
  DashboardStats,
  SalesAnalytics,
} from '../types/author.types';
import { ApiResponse, PaginationParams } from '../types/common.types';

export const authorService = {
  getProfile: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_PROFILE);
    return response.data;
  },

  updateProfile: async (data: UpdateAuthorProfileRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.AUTHOR.UPDATE_PROFILE, data);
    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await axiosInstance.post(
      API_ENDPOINTS.AUTHOR.UPLOAD_PROFILE_PICTURE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_DASHBOARD);
    return response.data;
  },

  getMyBooks: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_MY_BOOKS, { params });
    return response.data;
  },

  getTransactions: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_TRANSACTIONS, { params });
    return response.data;
  },

  addBankAccount: async (data: AddBankAccountRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTHOR.ADD_BANK_ACCOUNT, data);
    return response.data;
  },

  getBankAccounts: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_BANK_ACCOUNTS);
    return response.data;
  },

  deleteBankAccount: async (accountId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.AUTHOR.DELETE_BANK_ACCOUNT(accountId)
    );
    return response.data;
  },

  getReferrals: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_REFERRALS);
    return response.data;
  },

  getSalesAnalytics: async (params?: any): Promise<ApiResponse<SalesAnalytics>> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTHOR.GET_SALES_ANALYTICS, {
      params,
    });
    return response.data;
  },
};
