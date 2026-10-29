import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  Op,
  type WhereOptions,
} from 'sequelize';

import type { ISinhVienDTO } from '../dtos/sinhVien.dto.js';
import { SinhVien } from '../models/SinhVien.js';
import { AppError } from '../utils/AppError.js';

export interface PaginatedSinhVienResult {
  data: ISinhVienDTO[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

type ISinhVienUpdateDTO = Pick<
  ISinhVienDTO,
  'hoTen' | 'email' | 'maLop'
>;

const CREATE_FIELDS = [
  'maSV',
  'hoTen',
  'email',
  'maLop',
] as const;

const UPDATE_FIELDS = [
  'hoTen',
  'email',
  'maLop',
] as const;

// Kiểm tra body và từ chối trường ngoài hợp đồng
function getValidatedObject(
  input: unknown,
  allowedFields: readonly string[]
): Record<string, unknown> {
  if (
    input === null ||
    typeof input !== 'object' ||
    Array.isArray(input)
  ) {
    throw new AppError(
      400,
      'Dữ liệu gửi lên phải là một object hợp lệ'
    );
  }

  const body = input as Record<string, unknown>;

  const extraFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key)
  );

  if (extraFields.length > 0) {
    throw new AppError(
      400,
      `Trường dữ liệu không được hỗ trợ: ${extraFields.join(', ')}`
    );
  }

  return body;
}

// Kiểm tra các trường dùng chung cho POST và PUT
function validateCommonFields(
  body: Record<string, unknown>
): ISinhVienUpdateDTO {
  const { hoTen, email, maLop } = body;

  if (
    typeof hoTen !== 'string' ||
    typeof email !== 'string' ||
    typeof maLop !== 'string'
  ) {
    throw new AppError(
      400,
      'Các trường hoTen, email, maLop bắt buộc phải là chuỗi'
    );
  }

  const trimmedHoTen = hoTen.trim();
  const trimmedEmail = email.trim();
  const trimmedMaLop = maLop.trim();

  if (!trimmedHoTen) {
    throw new AppError(
      400,
      'Họ tên không được để trống'
    );
  }

  if (!trimmedEmail) {
    throw new AppError(
      400,
      'Email không được để trống'
    );
  }

  if (!trimmedMaLop) {
    throw new AppError(
      400,
      'Mã lớp không được để trống'
    );
  }

  // Kiểm tra email theo định dạng cơ bản
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw new AppError(
      400,
      'Định dạng email không hợp lệ'
    );
  }

  // Giới hạn độ dài theo Sequelize Model hiện tại
  if (trimmedHoTen.length > 150) {
    throw new AppError(
      400,
      'Họ tên không được vượt quá 150 ký tự'
    );
  }

  if (trimmedEmail.length > 254) {
    throw new AppError(
      400,
      'Email không được vượt quá 254 ký tự'
    );
  }

  if (trimmedMaLop.length > 50) {
    throw new AppError(
      400,
      'Mã lớp không được vượt quá 50 ký tự'
    );
  }

  return {
    hoTen: trimmedHoTen,
    email: trimmedEmail,
    maLop: trimmedMaLop,
  };
}

// Validation dành riêng cho POST
function validateSinhVien(
  input: unknown
): ISinhVienDTO {
  const body = getValidatedObject(
    input,
    CREATE_FIELDS
  );

  const maSV = body.maSV;

  if (typeof maSV !== 'string') {
    throw new AppError(
      400,
      'Mã sinh viên bắt buộc phải là chuỗi'
    );
  }

  const trimmedMaSV = maSV.trim();

  if (!/^SV[0-9]{3}$/.test(trimmedMaSV)) {
    throw new AppError(
      400,
      'Mã sinh viên phải có dạng SV và 3 chữ số, ví dụ SV003'
    );
  }

  const commonFields = validateCommonFields(body);

  return {
    maSV: trimmedMaSV,
    ...commonFields,
  };
}

// Validation dành riêng cho PUT
function validateSinhVienUpdate(
  input: unknown
): ISinhVienUpdateDTO {
  const body = getValidatedObject(
    input,
    UPDATE_FIELDS
  );

  return validateCommonFields(body);
}

// Chuyển Sequelize Model thành DTO
function toDTO(row: SinhVien): ISinhVienDTO {
  return {
    maSV: row.maSV,
    hoTen: row.hoTen,
    email: row.email,
    maLop: row.maLop,
  };
}

// Lấy danh sách sinh viên có phân trang và tìm kiếm (findAndCountAll)
export async function layDanhSachSinhVien(query?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedSinhVienResult> {
  const page = Math.max(1, query?.page ?? 1);
  const limit = Math.max(1, Math.min(50, query?.limit ?? 10));
  const search = query?.search?.trim() ?? '';

  const offset = (page - 1) * limit;

  const whereClause: WhereOptions = {};
  if (search) {
    whereClause.hoTen = {
      [Op.like]: `%${search}%`,
    };
  }

  // Thực thi phân trang và đếm trực tiếp tại SQL Server
  const { count, rows } = await SinhVien.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [['maSV', 'ASC']],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows.map(toDTO),
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages,
    },
  };
}

// Tìm sinh viên theo mã
export async function timSinhVienTheoMa(
  maSV: string
): Promise<ISinhVienDTO | undefined> {
  const row = await SinhVien.findByPk(maSV);

  if (!row) {
    return undefined;
  }

  return toDTO(row);
}

// Thêm sinh viên
export async function themSinhVien(
  input: unknown
): Promise<ISinhVienDTO> {
  const data = validateSinhVien(input);

  const existed = await SinhVien.findByPk(data.maSV);

  if (existed) {
    throw new AppError(
      409,
      'Mã sinh viên đã tồn tại'
    );
  }

  try {
    const row = await SinhVien.create(data);

    return toDTO(row);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(
        409,
        'Mã sinh viên đã tồn tại'
      );
    }

    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(
        400,
        'Mã lớp không tồn tại hoặc vi phạm ràng buộc khóa ngoại'
      );
    }

    throw error;
  }
}

// Cập nhật sinh viên
export async function capNhatSinhVien(
  maSV: string,
  input: unknown
): Promise<ISinhVienDTO | undefined> {
  // Kiểm tra toàn bộ body trước khi cập nhật
  const data = validateSinhVienUpdate(input);

  const row = await SinhVien.findByPk(maSV);

  if (!row) {
    return undefined;
  }

  try {
    await row.update(data);

    return toDTO(row);
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(
        400,
        'Mã lớp không tồn tại hoặc vi phạm ràng buộc khóa ngoại'
      );
    }

    throw error;
  }
}

// Xóa sinh viên
export async function xoaSinhVien(
  maSV: string
): Promise<boolean> {
  const row = await SinhVien.findByPk(maSV);

  if (!row) {
    return false;
  }

  try {
    await row.destroy();

    return true;
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      throw new AppError(
        400,
        'Không thể xóa sinh viên do dữ liệu đang được tham chiếu'
      );
    }

    throw error;
  }
}
