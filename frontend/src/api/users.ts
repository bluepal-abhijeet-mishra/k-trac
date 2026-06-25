import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

// Since we are not doing a full auth implementation in this step (as per typical instructions),
// we might mock the auth token or let the user service handle it based on environment config later.
// For now, let's just make the standard requests.

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  homeLocationId?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  homeLocationId?: number;
}

export const usersApi = {
  getUsers: async (page = 0, size = 10) => {
    const response = await api.get<PaginatedResponse<User>>('/users', {
      params: { page, size },
    });
    return response.data;
  },

  createUser: async (userData: UserCreateRequest) => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  deactivateUser: async (id: string) => {
    const response = await api.patch<void>(`/users/${id}/deactivate`);
    return response.data;
  },

  // other endpoints from EPIC-01 can be added here
};
