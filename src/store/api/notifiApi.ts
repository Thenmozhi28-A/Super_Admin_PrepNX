import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { NotificationResponse } from '../../types/Types';

export const notifiApi = createApi({
  reducerPath: 'notifiApi',
  tagTypes: ['Notifications'],
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
    getNotifications: builder.query<NotificationResponse, void>({
      query: () => '/api/notifications',
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation } = notifiApi;
