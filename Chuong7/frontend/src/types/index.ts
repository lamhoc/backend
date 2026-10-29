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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface LoginData {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  user: User;
}
