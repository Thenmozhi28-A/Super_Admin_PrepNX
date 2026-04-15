import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProfileResponse } from '../../types/Types';

export const profileApi = createApi({
  reducerPath: 'profileApi',
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
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/api/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<ProfileResponse, FormData>({
      query: (formData) => ({
        url: '/api/profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation<{ statusCode: number; message: string }, any>({
      query: (body) => ({
        url: '/api/profile',
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const { 
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation
} = profileApi;
