import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { PaginatedProductResponse, ProductResponse, ProductFormValues } from '../../types/Types';

export const productApi = createApi({
  reducerPath: 'productApi',
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
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedProductResponse, { page: number; size: number; search?: string }>({
      query: ({ page, size, search }) => ({
        url: '/api/products',
        params: { page, size, search },
      }),
      providesTags: ['Products'],
    }),
    addProduct: builder.mutation<ProductResponse, ProductFormValues>({
      query: (newProduct) => ({
        url: '/api/products',
        method: 'POST',
        body: newProduct,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation<ProductResponse, { id: string; product: ProductFormValues }>({
      query: ({ id, product }) => ({
        url: `/api/products/${id}`,
        method: 'PUT',
        body: product,
      }),
      invalidatesTags: ['Products'],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const { 
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productApi;
