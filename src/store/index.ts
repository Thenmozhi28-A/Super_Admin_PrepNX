import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { notifiApi } from './api/notifiApi';
import { profileApi } from './api/profileApi';
import { organizationApi } from './api/organizationApi';
import { userApi } from './api/userApi';
import { platformApi } from './api/platformApi';
import { rolesApi } from './api/rolesApi';
import { permissionApi } from './api/permissionApi';
import { productApi } from './api/productApi';
import { pricePlanApi } from './api/pricePlanApi';
import { emailApi } from './api/emailApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [notifiApi.reducerPath]: notifiApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [organizationApi.reducerPath]: organizationApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [platformApi.reducerPath]: platformApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [permissionApi.reducerPath]: permissionApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [pricePlanApi.reducerPath]: pricePlanApi.reducer,
    [emailApi.reducerPath]: emailApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      profileApi.middleware,
      rolesApi.middleware,
      notifiApi.middleware,
      organizationApi.middleware,
      platformApi.middleware,
      permissionApi.middleware,
      productApi.middleware,
      userApi.middleware,
      pricePlanApi.middleware,
      emailApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
