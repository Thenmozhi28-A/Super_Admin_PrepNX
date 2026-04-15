import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  PaginatedIndividualUserResponse, 
  SingleIndividualUserResponse,
  AuditLogResponse,
  PaginatedUserResponse,
} from '../../types/Types';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://admin.api.prepnx.yaacreations.com',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['IndividualUser', 'AuditLog'],
  endpoints: (builder) => ({
    getIndividualUsers: builder.query<PaginatedIndividualUserResponse, { page: number; size: number; search?: string }>({
      query: ({ page, size, search }) => ({
        url: '/api/users/individual',
        params: { page, size, search },
      }),
      providesTags: ['IndividualUser'],
    }),
    getUsers: builder.query<PaginatedUserResponse, { page: number; size: number; organisationId?: string }>({
      query: (params) => ({
        url: '/api/users',
        params,
      }),
    }),
    getIndividualUserById: builder.query<SingleIndividualUserResponse, string>({
      query: (id) => `/api/users/individual/${id}`,
      providesTags: (_, __, id) => [{ type: 'IndividualUser', id }],
    }),
    getUserLogs: builder.query<AuditLogResponse, { userId: string; page: number; size: number }>({
      query: ({ userId, page, size }) => ({
        url: '/api/audit-logs/user-logs',
        params: { userId, page, size },
      }),
      providesTags: ['AuditLog'],
    }),
    resendInvite: builder.mutation<any, { emailOrNumber: string }>({
      query: ({ emailOrNumber }) => ({
        url: '/api/users/resend-invite',
        method: 'POST',
        params: { email: emailOrNumber },
      }),
    }),
    toggleUserStatus: builder.mutation<any, { userId: string; active: boolean }>({
      query: ({ userId, active }) => ({
        url: `/api/users/${userId}/status`,
        method: 'PUT',
        params: { active },
      }),
      invalidatesTags: ['IndividualUser'],
    }),
  }),
});

export const { 
  useGetIndividualUsersQuery, 
  useGetIndividualUserByIdQuery,
  useGetUserLogsQuery,
  useResendInviteMutation,
  useToggleUserStatusMutation,
  useGetUsersQuery,
} = userApi;
