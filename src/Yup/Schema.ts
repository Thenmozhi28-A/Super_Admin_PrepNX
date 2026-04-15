import * as yup from 'yup';
import type { LoginValues, ForgotEmailValues, NewPasswordValues, RoleForm } from '../types/Types';

export const loginSchema: yup.ObjectSchema<LoginValues> = yup.object().shape({
  identifier: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const forgotEmailSchema: yup.ObjectSchema<ForgotEmailValues> = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

export const newPasswordSchema: yup.ObjectSchema<NewPasswordValues> = yup.object().shape({
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const roleSchema: yup.ObjectSchema<RoleForm> = yup.object().shape({
  name: yup
    .string()
    .required('Role name is required'),
  description: yup
    .string()
    .required('Description is required'),
});

export const permissionFormSchema = yup.object().shape({
  label: yup.string().required('Display Label is required'),
  module: yup.string().required('Module Code is required'),
  category: yup.string().required('Category is required'),
  description: yup.string().required('Description is required'),
  canCreate: yup.boolean().required(),
  canRead: yup.boolean().required(),
  canUpdate: yup.boolean().required(),
  canDelete: yup.boolean().required(),
});

export const productFormSchema = yup.object().shape({
  name: yup.string().required('Product Name is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  logoUrl: yup.string().optional(),
  status: yup.string().oneOf(['ACTIVE', 'INACTIVE']).required(),
  default: yup.boolean().required(),
});

export const pricePlanFormSchema = yup.object().shape({
  name: yup.string().required('Plan Name is required'),
  price: yup.number().min(0, 'Price must be 0 or greater').required('Price is required'),
  planType: yup.string().required('Plan Type is required'),
  category: yup.string().required('Category is required'),
  days: yup.number().min(1, 'Validity must be at least 1 day').required('Validity is required'),
  userCount: yup.number().min(0).required('User Count is required'),
  maxTeams: yup.lazy(value => 
    typeof value === 'string' 
      ? yup.string().oneOf(['Unlimited']) 
      : yup.number().min(0)
  ),
  maxStorageGB: yup.number().min(0).required('Max Storage is required'),
  features: yup.array().of(yup.string()).default([]),
  includedProductIds: yup.array().of(yup.string()).min(1, 'Select at least one product').required(),
  active: yup.boolean().required(),
  default: yup.boolean().required(),
});
