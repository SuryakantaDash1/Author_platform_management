import axiosInstance from '../api/interceptors';

export const utilityService = {
  lookupPincode: async (pin: string) => {
    const response = await axiosInstance.get(`/utility/pincode/${pin}`);
    return response.data;
  },
};
