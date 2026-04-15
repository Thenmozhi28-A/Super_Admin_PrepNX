import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  PaginatedOrganisationResponse, 
  OrganisationTypesResponse,
  SingleOrganisationResponse,
  AuditLogResponse,
  PricePlansResponse,
} from '../../types/Types';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
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
  tagTypes: ['Organisation', 'OrganisationType'],
  endpoints: (builder) => ({
    getOrganisations: builder.query<PaginatedOrganisationResponse, { page: number; size: number; typeId?: string }>({
      query: ({ page, size, typeId }) => ({
        url: '/api/organisations',
        params: {
          page,
          size,
          ...(typeId && { typeId }),
        },
      }),
      providesTags: ['Organisation'],
    }),
    getOrganisationTypes: builder.query<OrganisationTypesResponse, void>({
      query: () => '/api/organisation-types',
      providesTags: ['OrganisationType'],
    }),
    getOrganisationById: builder.query<SingleOrganisationResponse, string>({
      query: (id) => `/api/organisations/${id}`,
      providesTags: (_, __, id) => [{ type: 'Organisation', id }],
    }),
    getAuditLogs: builder.query<AuditLogResponse, { organisationId: string; page: number; size: number }>({
      query: ({ organisationId, page, size }) => ({
        url: '/api/audit-logs',
        params: { organisationId, page, size },
      }),
    }),
    getPricePlans: builder.query<PricePlansResponse, string>({
      query: (type) => ({
        url: '/api/price-plans',
        params: { type },
      }),
    }),
    registerOrganisation: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/api/auth/register-organisation',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Organisation'],
    }),
    createOrganisation: builder.mutation<any, any>({
      query: (data) => ({
        url: '/api/organisations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organisation'],
    }),
  }),
});

export const { 
  useGetOrganisationsQuery, 
  useGetOrganisationTypesQuery,
  useGetOrganisationByIdQuery,
  useGetAuditLogsQuery,
  useGetPricePlansQuery,
  useRegisterOrganisationMutation,
  useCreateOrganisationMutation 
} = organizationApi;
