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

    // Express 5 exposes req.query as a getter, so validate it without reassignment.
    if (target === 'body') {
      req.body = parsed.data;
    } else {
      req.params = parsed.data as any;
    }

    next();
  };
};

export const validateQuery = (schema: z.ZodType): RequestHandler =>
  validate(schema, 'query');
