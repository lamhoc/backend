import type { Request, Response } from 'express';
import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
  capNhatSinhVien as capNhatSinhVienService,
  xoaSinhVien as xoaSinhVienService,
} from '../services/sinhVien.service.js';
import { AppError } from '../utils/AppError.js';
import type { SinhVienQueryInput } from '../validations/sinhVien.schema.js';

// GET danh sách sinh viên có phân trang & tìm kiếm (Tận dụng Express 5 tự động chuyển lỗi async sang Error Middleware)
export const getDanhSachSinhVien = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = req.query as unknown as SinhVienQueryInput;
  const result = await layDanhSachSinhVien(query);

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách sinh viên thành công',
    data: result.data,
    pagination: result.pagination,
  });
};

// GET sinh viên theo mã
export const getSinhVienTheoMa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const maSV = req.params.maSV as string;
  const sinhVien = await timSinhVienTheoMa(maSV);

  if (!sinhVien) {
    throw new AppError(404, 'Không tìm thấy sinh viên');
  }

  res.status(200).json({
    success: true,
    message: 'Tìm sinh viên thành công',
    data: sinhVien,
  });
};

// POST thêm sinh viên
export const taoSinhVien = async (
  req: Request,
  res: Response
): Promise<void> => {
  const newSV = await themSinhVien(req.body);

  res.status(201).json({
    success: true,
    message: 'Thêm sinh viên thành công',
    data: newSV,
  });
};

// PUT cập nhật sinh viên
export const capNhatSinhVien = async (
  req: Request,
  res: Response
): Promise<void> => {
  const maSV = req.params.maSV as string;
  const sinhVien = await capNhatSinhVienService(maSV, req.body);

  if (!sinhVien) {
    throw new AppError(404, 'Không tìm thấy sinh viên');
  }

  res.status(200).json({
    success: true,
    message: 'Cập nhật sinh viên thành công',
    data: sinhVien,
  });
};

// DELETE xóa sinh viên
export const xoaSinhVien = async (
  req: Request,
  res: Response
): Promise<void> => {
  const maSV = req.params.maSV as string;
  const deleted = await xoaSinhVienService(maSV);

  if (!deleted) {
    throw new AppError(404, 'Không tìm thấy sinh viên');
  }

  res.status(200).json({
    success: true,
    message: 'Xóa sinh viên thành công',
  });
};
