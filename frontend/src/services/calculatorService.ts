import axios from 'axios';
import axiosInstance from '../api/interceptors';
import { API_ENDPOINTS } from '../api/endpoints';
import { API_BASE_URL } from '../api/axios.config';

// Plain axios instance for public endpoints — no auth interceptors, no redirect on 401
const publicAxios = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

export interface PaperConfig {
  paperName: string;
  paperSize: string;
  pricePerPage: number;
}

export interface CalculatorConfig {
  _id?: string;
  paperConfigs: PaperConfig[];
  mspPercent: number;
  mrpPercent: number;
  royaltyFromMrpPercent: number;
  offlineExpensesPercent: number;
  onlineExpensesPercent: number;
  ebookRoyaltyPercent: number;
  ebookOnlineExpensesPercent: number;
  magazineRoyaltyOverride: number | null;
  updatedBy?: string;
  updatedAt?: string;
}

export const calculatorService = {
  getPublicConfig: async (): Promise<CalculatorConfig | null> => {
    const res = await publicAxios.get(API_ENDPOINTS.CALCULATOR.GET_PUBLIC_CONFIG);
    return res.data?.data?.config ?? null;
  },

  getAdminConfig: async (): Promise<CalculatorConfig | null> => {
    const res = await axiosInstance.get(API_ENDPOINTS.CALCULATOR.GET_ADMIN_CONFIG);
    return res.data?.data?.config ?? null;
  },

  saveConfig: async (config: Omit<CalculatorConfig, '_id' | 'updatedBy' | 'updatedAt'>): Promise<CalculatorConfig> => {
    const res = await axiosInstance.put(API_ENDPOINTS.CALCULATOR.SAVE_CONFIG, config);
    return res.data?.data?.config;
  },
};
