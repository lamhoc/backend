import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, 'Họ tên không được để trống')
      .max(150, 'Họ tên không được vượt quá 150 ký tự'),
    email: z
      .string()
      .trim()
      .min(1, 'Email không được để trống')
      .email('Email không đúng định dạng')
      .max(254, 'Email không được vượt quá 254 ký tự'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email không được để trống')
      .email('Email không đúng định dạng'),
    password: z
      .string()
      .min(1, 'Mật khẩu không được để trống'),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
