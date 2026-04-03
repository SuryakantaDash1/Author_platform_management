import axiosInstance from '../api/interceptors';
import { API_ENDPOINTS } from '../api/endpoints';
import { CreateTicketRequest, AddMessageRequest } from '../types/book.types';
import { ApiResponse, PaginationParams } from '../types/common.types';

export const supportService = {
  createTicket: async (data: CreateTicketRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(API_ENDPOINTS.SUPPORT.CREATE_TICKET, data);
    return response.data;
  },

  getMyTickets: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.SUPPORT.GET_MY_TICKETS, { params });
    return response.data;
  },

  getTicket: async (ticketId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.SUPPORT.GET_TICKET(ticketId));
    return response.data;
  },

  addMessage: async (ticketId: string, data: AddMessageRequest): Promise<ApiResponse> => {
    const response = await axiosInstance.post(
      API_ENDPOINTS.SUPPORT.ADD_MESSAGE(ticketId),
      data
    );
    return response.data;
  },

  updateTicketStatus: async (ticketId: string, status: string): Promise<ApiResponse> => {
    const response = await axiosInstance.put(
      API_ENDPOINTS.SUPPORT.UPDATE_TICKET_STATUS(ticketId),
      { status }
    );
    return response.data;
  },

  // Admin endpoints
  searchTickets: async (params?: PaginationParams & any): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.SUPPORT.SEARCH_TICKETS, { params });
    return response.data;
  },

  getTicketStats: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.SUPPORT.GET_TICKET_STATS);
    return response.data;
  },

  assignTicket: async (ticketId: string, assignedTo?: string): Promise<ApiResponse> => {
    const response = await axiosInstance.put(API_ENDPOINTS.SUPPORT.ASSIGN_TICKET(ticketId), {
      assignedTo,
    });
    return response.data;
  },
};
