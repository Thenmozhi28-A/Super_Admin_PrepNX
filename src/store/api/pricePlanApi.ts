import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PricePlansResponse, PricePlanResponse, PricePlanFormValues } from '../../types/Types';

export const pricePlanApi = createApi({
  reducerPath: 'pricePlanApi',
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
  tagTypes: ['PricePlans'],
  endpoints: (builder) => ({
    getPricePlans: builder.query<PricePlansResponse, { page: number; size: number; search?: string }>({
      query: ({ page, size, search }) => ({
        url: '/api/price-plans',
        params: { page, size, search },
      }),
      providesTags: ['PricePlans'],
    }),
    addPricePlan: builder.mutation<PricePlanResponse, PricePlanFormValues>({
      query: (newPlan) => ({
        url: '/api/price-plans',
        method: 'POST',
        body: newPlan,
      }),
      invalidatesTags: ['PricePlans'],
    }),
    updatePricePlan: builder.mutation<PricePlanResponse, { id: string; plan: PricePlanFormValues }>({
      query: ({ id, plan }) => ({
        url: `/api/price-plans/${id}`,
        method: 'PUT',
        body: plan,
      }),
      invalidatesTags: ['PricePlans'],
    }),
    deletePricePlan: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/price-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PricePlans'],
    }),
  }),
});

export const { 
  useGetPricePlansQuery,
  useAddPricePlanMutation,
  useUpdatePricePlanMutation,
  useDeletePricePlanMutation
} = pricePlanApi;
