import { Router } from 'express';
import { validate, validateQuery } from '../middlewares/validate.middleware.js';
import { isAuth, isAdmin } from '../middlewares/auth.middleware.js';
import {
  createSinhVienSchema,
  updateSinhVienSchema,
  sinhVienQuerySchema,
} from '../validations/sinhVien.schema.js';

import {
  getDanhSachSinhVien,
  getSinhVienTheoMa,
  taoSinhVien,
  capNhatSinhVien,
  xoaSinhVien,
} from '../controllers/sinhVien.controller.js';

const router = Router();

// GET danh sách sinh viên (Public, có phân trang & tìm kiếm)
router.get('/', validateQuery(sinhVienQuerySchema), getDanhSachSinhVien);

// GET sinh viên theo mã (Public)
router.get('/:maSV', getSinhVienTheoMa);

// POST thêm sinh viên (Yêu cầu Đăng nhập & Quyền Admin)
router.post('/', isAuth, isAdmin, validate(createSinhVienSchema), taoSinhVien);

// PUT cập nhật sinh viên (Yêu cầu Đăng nhập & Quyền Admin)
router.put('/:maSV', isAuth, isAdmin, validate(updateSinhVienSchema), capNhatSinhVien);

// DELETE xóa sinh viên (Yêu cầu Đăng nhập & Quyền Admin)
router.delete('/:maSV', isAuth, isAdmin, xoaSinhVien);

export default router;
