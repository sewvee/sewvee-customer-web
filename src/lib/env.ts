// Mirrors the mobile app's src/config/env.js exactly
// All URL constants must match backend routes

const API_DOMAIN =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://api.sewvee.com';

export const BASE_URL = `${API_DOMAIN}/mobile/`;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const URL_CUSTOMER_LOGIN = `${BASE_URL}customer-auth/login`;
export const URL_CUSTOMER_REGISTER = `${BASE_URL}customer-auth/register`;

// ─── Customer Portal ─────────────────────────────────────────────────────────
export const URL_CUSTOMER_PORTAL_ORDERS = `${BASE_URL}customer-portal/orders`;
export const URL_CUSTOMER_PORTAL_SHOP   = `${BASE_URL}customer-portal/shop`;
export const URL_CUSTOMER_STORE_CATALOGUE = `${API_DOMAIN}/mobile/marketing/customer/store/catalogue`;

// ─── Gallery (new server-side API) ────────────────────────────────────────────
export const URL_CUSTOMER_GALLERY         = `${BASE_URL}customer-portal/gallery`;
export const URL_CUSTOMER_GALLERY_FOLDERS = `${URL_CUSTOMER_GALLERY}/folders`;
export const URL_GALLERY_FOLDER_IMAGES    = (folderId: string) =>
  `${URL_CUSTOMER_GALLERY}/folders/${folderId}/images`;
export const URL_GALLERY_FOLDER_IMAGE     = (folderId: string, imageId: string) =>
  `${URL_CUSTOMER_GALLERY}/folders/${folderId}/images/${imageId}`;
export const URL_GALLERY_FOLDER           = (folderId: string) =>
  `${URL_CUSTOMER_GALLERY}/folders/${folderId}`;

// ─── Upload (S3) ──────────────────────────────────────────────────────────────
export const URL_UPLOAD = `${API_DOMAIN}/upload/mobile`;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const URL_ORDERS = `${BASE_URL}orders`;
export const URL_ORDER_STATUS = (id: string) => `${URL_ORDERS}/${id}/status`;
export const URL_CUSTOMER_PORTAL_ORDER_STATUS = (id: string) => `${URL_CUSTOMER_PORTAL_ORDERS}/${id}/status`;
export const URL_ORDER_INVOICE_DOWNLOAD = (id: string) =>
  `${URL_ORDERS}/${id}/invoice/download`;
export const URL_ORDER_TAILORING_COPY_DOWNLOAD = (id: string) =>
  `${URL_ORDERS}/${id}/tailoringcopy/download`;

// ─── Location ─────────────────────────────────────────────────────────────────
export const URL_LOCATION_COUNTRIES = `${BASE_URL}location/countries`;
export const URL_LOCATION_STATES = `${BASE_URL}location/states`;
export const URL_LOCATION_CITIES = `${BASE_URL}location/cities`;
