import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  layDanhSachSinhVien,
  timSinhVienTheoMa,
  themSinhVien,
  capNhatSinhVien as capNhatSinhVienService,
  xoaSinhVien as xoaSinhVienService,
} from '../services/sinhVien.service.js';

// GET danh sách
export const getDanhSachSinhVien = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await layDanhSachSinhVien();

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sinh viên thành công',
      data,
    });
  } catch (error) {
    next(error);
  }
};

// GET theo mã
export const getSinhVienTheoMa = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const maSV = req.params.maSV as string;

    const sinhVien = await timSinhVienTheoMa(maSV);

    if (!sinhVien) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Tìm sinh viên thành công',
      data: sinhVien,
    });
  } catch (error) {
    next(error);
  }
};

// POST thêm sinh viên
export const taoSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newSV = await themSinhVien(req.body);

    res.status(201).json({
      success: true,
      message: 'Thêm sinh viên thành công',
      data: newSV,
    });
  } catch (error) {
    next(error);
  }
};

// PUT cập nhật sinh viên
export const capNhatSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const maSV = req.params.maSV as string;

    const sinhVien = await capNhatSinhVienService(
      maSV,
      req.body
    );

    if (!sinhVien) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật sinh viên thành công',
      data: sinhVien,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE xóa sinh viên
export const xoaSinhVien = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const maSV = req.params.maSV as string;

    const deleted = await xoaSinhVienService(maSV);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
        data: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Xóa sinh viên thành công',
    });
  } catch (error) {
    next(error);
  }
};
