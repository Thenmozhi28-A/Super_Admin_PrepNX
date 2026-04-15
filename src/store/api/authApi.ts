import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { LoginValues, LoginResponse } from '../../types/Types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://admin.api.prepnx.yaacreations.com' }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginValues>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
