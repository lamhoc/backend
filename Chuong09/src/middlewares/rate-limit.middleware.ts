import rateLimit from 'express-rate-limit';

// Rate limiter riêng cho POST /api/auth/login: tối đa 5 request / 60 giây
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 giây
  max: 5, // Tối đa 5 request trong 60 giây
  standardHeaders: true, // Trả về RateLimit-* headers chuẩn IETF
  legacyHeaders: false, // Tắt X-RateLimit-* cũ
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      status: 429,
      message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 60 giây.',
      data: null,
    });
  },
});

