import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  EmailTemplatesResponse, 
  EmailPreviewResponse, 
  EmailTemplate,
  BulkSendRequest 
} from '../../types/Types';

export const emailApi = createApi({
  reducerPath: 'emailApi',
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
  tagTypes: ['EmailTemplates'],
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<EmailTemplatesResponse, void>({
      query: () => '/api/email-templates',
      providesTags: ['EmailTemplates'],
    }),
    getEmailPreview: builder.query<EmailPreviewResponse, string>({
      query: (id) => `/api/email-templates/${id}/preview`,
    }),
    createEmailTemplate: builder.mutation<EmailTemplatesResponse, Partial<EmailTemplate>>({
      query: (template) => ({
        url: '/api/email-templates',
        method: 'POST',
        body: template,
      }),
      invalidatesTags: ['EmailTemplates'],
    }),
    updateEmailTemplate: builder.mutation<EmailTemplatesResponse, { id: string; template: Partial<EmailTemplate> }>({
      query: ({ id, template }) => ({
        url: `/api/email-templates/${id}`,
        method: 'PUT',
        body: template,
      }),
      invalidatesTags: ['EmailTemplates'],
    }),
    bulkSendEmail: builder.mutation<{ statusCode: number; message: string; data: any }, BulkSendRequest>({
      query: (body) => ({
        url: '/api/email-templates/bulk-send',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetEmailTemplatesQuery,
  useGetEmailPreviewQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useBulkSendEmailMutation,
} = emailApi;
