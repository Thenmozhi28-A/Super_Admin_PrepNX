export interface LoginValues {
  identifier: string;
  password: string;
}

export interface ForgotEmailValues {
  email: string;
}

export interface NewPasswordValues {
  password: string;
  confirmPassword: string;
}



export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: ApiPermission[];
}

export interface OrganisationType {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string | null;
  logoUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  default: boolean;
  createdAt?: number;
  updatedAt?: number;
}



export interface Organisation {
  id: string;
  name: string;
  workspaceUrl: string;
  brandColor: string | null;
  logoUrl: string | null;
  type: OrganisationType;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  pricePlan: PricePlan;
  currentStorageGB: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  verifiedDomains: string[] | null;
  ssoEnabled: boolean;
  guestAccessAllowed: boolean;
  totalUsers: number;
  email: string;
  mobileNumber: string | null;
}

export interface PaginationInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginatedOrganisationResponse {
  statusCode: number;
  message: string;
  data: {
    content: Organisation[];
    page: PaginationInfo;
  };
}

export interface OrganisationTypesResponse {
  statusCode: number;
  message: string;
  data: OrganisationType[];
}

export interface User {
  id: string;
  token: string;
  email: string;
  mobileNumber: string;
  name: string;
  roles: Role[];
  roleNames: string[];
  permissions: ApiPermission[];
  organisation: any; // Keep generic to avoid circular or too deep nesting in auth
  profilePictureUrl: string;
  userInterests: {
    currentPreparationStage: string | null;
    examAreYouPreparing: string | null;
    preferredLearningStyle: string | null;
    primaryFocusAreas: string | null;
  };
  dateOfBirth: string | null;
  gender: string | null;
  educationLevel: string | null;
  currentStatus: string | null;
  state: string | null;
  examPreferences: string | null;
  active: boolean;
  mfaEnabled: boolean;
  status: string;
  profilePicture: string;
}

export interface PaginatedUserResponse {
  statusCode: number;
  message: string;
  data: {
    content: User[];
    page: PaginationInfo;
  };
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: User;
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export interface HeaderProps {
  onMenuClick: () => void;
}

export interface ReadReceipt {
  id: string;
  read: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string | number;
  readReceiptDTOS?: ReadReceipt[];
}

export interface NotificationResponse {
  statusCode: number;
  message: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
  };
}

export interface NotificationsPopoverProps {
  notifications: Notification[];
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export interface ProfileResponse {
  statusCode: number;
  message: string;
  data: User;
}

export interface AuditLogUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePicture: string | null;
  roles: any;
}

export interface AuditLog {
  id: string;
  user: AuditLogUser;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
}

export interface AuditLogResponse {
  statusCode: number;
  message: string;
  data: {
    content: AuditLog[];
    page: PaginationInfo;
  };
}

export interface SingleOrganisationResponse {
  statusCode: number;
  message: string;
  data: Organisation;
}

export interface IndividualUser {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: Role[];
  status: 'ACTIVE' | 'INACTIVE';
  pricePlan: PricePlan;
  profilePictureUrl: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  educationLevel: string | null;
  currentStatus: string | null;
  state: string | null;
  examPreferences: string[] | null;
  hometown: string | null;
  hobbies: string[] | null;
}

export interface PaginatedIndividualUserResponse {
  statusCode: number;
  message: string;
  data: {
    content: IndividualUser[];
    page: PaginationInfo;
  };
}

export interface SingleIndividualUserResponse {
  statusCode: number;
  message: string;
  data: IndividualUser;
}

// Platform Overview Types
export interface PlatformOverviewData {
  totalTenants: {
    count: number;
    newThisWeek: number;
  };
  totalActiveUsers: number;
  messagesToday: {
    count: number;
    peakRate: string;
  };
  globalStorage: string;
  platformGrowth: Record<string, number>;
}

export interface PlatformOverviewResponse {
  statusCode: number;
  message: string;
  data: PlatformOverviewData;
}

// Roles & Permissions Types
export interface ApiPermission {
  id: string;
  module: string;
  label: string;
  description: string;
  category: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface PermissionActionState {
  CREATE: boolean;
  READ: boolean;
  UPDATE: boolean;
  DELETE: boolean;
}

export interface ConsolePermission {
  id: string;
  module: string;
  name: string;
  description: string;
  icon: any;
  originalCategory: string;
  actions: PermissionActionState;
}

export interface PermissionCategory {
  id: string;
  name: string;
  permissions: ConsolePermission[];
}

export interface RoleData {
  id: string;
  name: string;
  description: string;
  categories: PermissionCategory[];
}

export interface RoleForm {
  name: string;
  description: string;
}

export interface RolesResponse {
  statusCode: number;
  message: string;
  data: Role[];
}

export interface PermissionsResponse {
  statusCode: number;
  message: string;
  data: ApiPermission[];
}

export interface PermissionFormValues {
  label: string;
  module: string;
  category: string;
  description: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface ProductResponse {
  statusCode: number;
  message: string;
  data: Product;
}

export interface PaginatedProductResponse {
  statusCode: number;
  message: string;
  data: {
    content: Product[];
    page: PaginationInfo;
  };
}

export interface ProductFormValues {
  name: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE';
  default: boolean;
  logoUrl?: string;
}

export interface PricePlan {
  id: string;
  name: string;
  price: number;
  planType: 'BASE' | 'MID' | 'PREMIUM' | 'CUSTOM' | 'FREE';
  features: string[];
  userCount: number;
  category: 'BUSINESS' | 'INDIVIDUAL';
  maxTeams: number | null;
  maxStorageGB: number;
  days: number;
  expiryDate: number;
  active: boolean;
  products: Product[];
  default: boolean;
}

export interface PricePlansResponse {
  statusCode: number;
  message: string;
  data: PricePlan[];
}

export interface PricePlanResponse {
  statusCode: number;
  message: string;
  data: PricePlan;
}

export interface PaginatedPricePlanResponse {
  statusCode: number;
  message: string;
  data: {
    content: PricePlan[];
    page: PaginationInfo;
  };
}

export interface PricePlanFormValues {
  name: string;
  price: number;
  planType: string;
  category: string;
  days: number;
  userCount: number;
  maxTeams: string | number; // 'Unlimited' or number
  maxStorageGB: number;
  features: string[];
  includedProductIds: string[];
  active: boolean;
  default: boolean;
}
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: string;
  organisationId: string | null;
  lastModified: number;
  default: boolean;
}

export interface EmailTemplatesResponse {
  statusCode: number;
  message: string;
  data: EmailTemplate[];
}

export interface EmailPreviewResponse {
  statusCode: number;
  message: string;
  data: string; // HTML string
}

export interface BulkSendRequest {
  templateId?: string;
  subject?: string;
  body?: string;
  recipientMode: 'all' | 'selective';
  selectedUserIds?: string[];
}
