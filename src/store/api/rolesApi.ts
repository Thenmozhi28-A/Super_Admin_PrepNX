import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RolesResponse } from '../../types/Types';

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
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
  tagTypes: ['Role'],
  endpoints: (builder) => ({
    getRoles: builder.query<RolesResponse, void>({
      query: () => '/api/roles',
      providesTags: ['Role'],
    }),
    addRole: builder.mutation<any, { name: string; description: string; permissionIds: string[] }>({
      query: (role) => ({
        url: '/api/roles',
        method: 'POST',
        body: role,
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation<any, { id: string; role: { name: string; description: string; permissionIds: string[] } }>({
      query: ({ id, role }) => ({
        url: `/api/roles/${id}`,
        method: 'PUT',
        body: role,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
  }),
});

export const { 
  useGetRolesQuery, 
  useAddRoleMutation, 
  useUpdateRoleMutation, 
  useDeleteRoleMutation 
} = rolesApi;
