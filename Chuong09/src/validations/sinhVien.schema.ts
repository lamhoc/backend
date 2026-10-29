import { z } from 'zod';
export * from './sinhVien.query.js';

// Giữ giới hạn đồng bộ với src/models/SinhVien.ts của Chương 4.
const editableFields = {
  hoTen: z
    .string()
    .trim()
    .min(1, 'Họ tên không được rỗng')
    .max(150, 'Họ tên không được vượt quá 150 ký tự'),
  email: z
    .string()
    .trim()
    .min(1, 'Email không được rỗng')
    .email('Email không hợp lệ')
    .max(254, 'Email không được vượt quá 254 ký tự'),
  maLop: z
    .string()
    .trim()
    .min(1, 'Mã lớp không được rỗng')
    .max(50, 'Mã lớp không được vượt quá 50 ký tự'),
};

// POST bắt buộc đủ maSV, hoTen, email, maLop.
// Mã SV theo quy tắc sẵn có của Service: SV + đúng 3 chữ số.
export const createSinhVienSchema = z
  .object({
    maSV: z
      .string()
      .trim()
      .regex(
        /^SV[0-9]{3}$/,
        'Mã sinh viên phải có dạng SV và 3 chữ số, ví dụ SV003'
      ),
    ...editableFields,
  })
  .strict();

// PUT lấy maSV từ URL; body chỉ được có 3 trường có thể sửa.
export const updateSinhVienSchema = z
  .object({
    ...editableFields,
  })
  .strict();

export type CreateSinhVienInput = z.infer<typeof createSinhVienSchema>;
export type UpdateSinhVienInput = z.infer<typeof updateSinhVienSchema>;
