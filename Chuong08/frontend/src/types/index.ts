export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'student' | 'admin';
  avatarUrl?: string | null;
}

export interface SinhVien {
  maSV: string;
  hoTen: string;
  email: string;
  maLop: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  status?: number;
  message: string;
  data: T;
  pagination?: Pagination;
  errors?: Array<{ field: string; message: string }>;
}

export interface LoginData {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}
