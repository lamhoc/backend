import type { RequestHandler } from 'express';
import { z } from 'zod';

export const validate = (schema: z.ZodType): RequestHandler => {
  return (req, res, next): void => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.flatMap((issue) => {
        // Báo đúng tên trường lạ bị .strict() từ chối (ví dụ role).
        if (issue.code === 'unrecognized_keys') {
          return issue.keys.map((key) => ({
            field: key,
            message: `Trường \"${key}\" không được phép`,
          }));
        }

        return [{
          field: issue.path.join('.') || 'body',
          message: issue.message,
        }];
      });

      res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        data: null,
        errors,
      });
      return; // Không để Request sai đi tiếp vào Controller.
    }

    req.body = parsed.data; // Controller nhận chuỗi đã trim và đã kiểm tra.
    next();
  };
};
