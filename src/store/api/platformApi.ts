import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PlatformOverviewResponse } from '../../types/Types';

export const platformApi = createApi({
  reducerPath: 'platformApi',
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
  endpoints: (builder) => ({
    getPlatformOverview: builder.query<PlatformOverviewResponse, void>({
      query: () => '/api/v1/platform/overview',
    }),
  }),
});

export const { useGetPlatformOverviewQuery } = platformApi;
