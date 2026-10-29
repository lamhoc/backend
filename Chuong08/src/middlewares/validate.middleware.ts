import type { RequestHandler } from 'express';
import { z } from 'zod';

export const validate = (
  schema: z.ZodType,
  target: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return (req, res, next): void => {
    const dataToValidate = req[target];
    const parsed = schema.safeParse(dataToValidate);

    if (!parsed.success) {
      const errors = parsed.error.issues.flatMap((issue) => {
        // Báo đúng tên trường lạ bị .strict() từ chối
        if (issue.code === 'unrecognized_keys') {
          return issue.keys.map((key) => ({
            field: key,
            message: `Trường \"${key}\" không được phép`,
          }));
        }

        return [
          {
            field: issue.path.join('.') || target,
            message: issue.message,
          },
        ];
      });

      res.status(400).json({
        success: false,
        status: 400,
        message: 'Dữ liệu đầu vào không hợp lệ',
        data: null,
        errors,
      });
      return;
    }

    // Gán dữ liệu đã được parse và chuẩn hóa (coerce, trim, default)
    if (target === 'query') {
      Object.defineProperty(req, 'query', {
        value: parsed.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else if (target === 'body') {
      req.body = parsed.data;
    } else {
      req.params = parsed.data as any;
    }

    next();
  };
};

export const validateQuery = (schema: z.ZodType): RequestHandler =>
  validate(schema, 'query');
