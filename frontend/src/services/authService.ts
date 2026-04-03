import axiosInstance from '../api/interceptors';
import { API_ENDPOINTS } from '../api/endpoints';
import {
  SendOTPRequest,
  VerifyOTPSignupRequest,
  VerifyOTPLoginRequest,
  RefreshTokenRequest,
  UpdateProfileRequest,
  ChangeEmailRequest,
  Verify2FARequest,
  LoginResponse,
  Enable2FAResponse,
} from '../types/auth.types';
import { ApiResponse } from '../types/common.types';

export const authService = {
  sendOTP: async (data: SendOTPRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_OTP, data);
    return response.data;
  },

  verifyOTPSignup: async (data: VerifyOTPSignupRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP_SIGNUP, data);
    return response.data;
  },

  verifyOTPLogin: async (data: VerifyOTPLoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_OTP_LOGIN, data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.GET_CURRENT_USER);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    return response.data;
  },

  changeEmail: async (data: ChangeEmailRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_EMAIL, data);
    return response.data;
  },

  enable2FA: async (): Promise<ApiResponse<Enable2FAResponse>> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.ENABLE_2FA);
    return response.data;
  },

  verify2FA: async (data: Verify2FARequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_2FA, data);
    return response.data;
  },

  disable2FA: async (data: Verify2FARequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.DISABLE_2FA, data);
    return response.data;
  },

  googleAuth: (): void => {
    window.location.href = `${axiosInstance.defaults.baseURL}${API_ENDPOINTS.AUTH.GOOGLE_AUTH}`;
  },

  microsoftAuth: (): void => {
    window.location.href = `${axiosInstance.defaults.baseURL}${API_ENDPOINTS.AUTH.MICROSOFT_AUTH}`;
  },
};
