import axiosInstance from '../api/interceptors';
import { API_ENDPOINTS } from '../api/endpoints';
import {
  CreateBookRequest,
  UpdateBookRequest,
  UpdateBookStatusRequest,
  UpdateSalesDataRequest,
} from '../types/book.types';
import { ApiResponse } from '../types/common.types';

export const bookService = {
  createBook: async (data: CreateBookRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.BOOKS.CREATE_BOOK, data);
    return response.data;
  },

  getBook: async (bookId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKS.GET_BOOK(bookId));
    return response.data;
  },

  updateBook: async (bookId: string, data: UpdateBookRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.BOOKS.UPDATE_BOOK(bookId), data);
    return response.data;
  },

  uploadCover: async (bookId: string, file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('coverPage', file);
    const response = await axiosInstance.post(
      API_ENDPOINTS.BOOKS.UPLOAD_COVER(bookId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  uploadFiles: async (bookId: string, files: File[]): Promise<ApiResponse> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('bookFiles', file);
    });
    const response = await axiosInstance.post(
      API_ENDPOINTS.BOOKS.UPLOAD_FILES(bookId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteFile: async (bookId: string, fileUrl: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(API_ENDPOINTS.BOOKS.DELETE_FILE(bookId), {
      data: { fileUrl },
    });
    return response.data;
  },

  submitForReview: async (bookId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.BOOKS.SUBMIT_FOR_REVIEW(bookId));
    return response.data;
  },

  deleteBook: async (bookId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(API_ENDPOINTS.BOOKS.DELETE_BOOK(bookId));
    return response.data;
  },

  getPricingSuggestions: async (language: string, bookType: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKS.GET_PRICING_SUGGESTIONS, {
      params: { language, bookType },
    });
    return response.data;
  },

  updateSalesData: async (
    bookId: string,
    data: UpdateSalesDataRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.BOOKS.UPDATE_SALES_DATA(bookId),
      data
    );
    return response.data;
  },

  updateBookStatus: async (
    bookId: string,
    data: UpdateBookStatusRequest
  ): Promise<ApiResponse> => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.ADMIN.UPDATE_BOOK_STATUS(bookId),
      data
    );
    return response.data;
  },
};
