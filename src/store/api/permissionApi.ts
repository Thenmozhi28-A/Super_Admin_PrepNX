import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PermissionsResponse, PermissionFormValues } from '../../types/Types';

export const permissionApi = createApi({
  reducerPath: 'permissionApi',
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
  tagTypes: ['Permissions'],
  endpoints: (builder) => ({
    getPermissions: builder.query<PermissionsResponse, void>({
      query: () => '/api/permissions',
      providesTags: ['Permissions'],
    }),
    addPermission: builder.mutation<void, PermissionFormValues>({
      query: (newPermission) => ({
        url: '/api/permissions',
        method: 'POST',
        body: newPermission,
      }),
      invalidatesTags: ['Permissions'],
    }),
    updatePermission: builder.mutation<void, { id: string; permission: PermissionFormValues }>({
      query: ({ id, permission }) => ({
        url: `/api/permissions/${id}`,
        method: 'PUT',
        body: permission,
      }),
      invalidatesTags: ['Permissions'],
    }),
    deletePermission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),
  }),
});

export const { 
  useGetPermissionsQuery,
  useAddPermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation
} = permissionApi;
