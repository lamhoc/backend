import { z } from 'zod';

const integerRegex = /^-?\d+$/;

export const sinhVienQuerySchema = z.object({
  page: z
    .preprocess((val) => {
      if (val === undefined || val === '') return 1;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!integerRegex.test(trimmed)) return NaN;
        return Number(trimmed);
      }
      return val;
    }, z.number({ invalid_type_error: 'Page phải là số nguyên hợp lệ' }).int('Page phải là số nguyên').min(1, 'Page phải lớn hơn hoặc bằng 1'))
    .default(1),
  limit: z
    .preprocess((val) => {
      if (val === undefined || val === '') return 10;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!integerRegex.test(trimmed)) return NaN;
        return Number(trimmed);
      }
      return val;
    }, z.number({ invalid_type_error: 'Limit phải là số nguyên hợp lệ' }).int('Limit phải là số nguyên').min(1, 'Limit phải lớn hơn hoặc bằng 1').max(50, 'Limit không được vượt quá 50'))
    .default(10),
  search: z
    .string({ invalid_type_error: 'Từ khóa tìm kiếm phải là chuỗi' })
    .trim()
    .max(80, 'Từ khóa tìm kiếm tối đa 80 ký tự')
    .default(''),
});

export type SinhVienQueryInput = z.infer<typeof sinhVienQuerySchema>;

