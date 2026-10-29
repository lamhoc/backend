import React, { useState, useRef } from 'react';
import { api } from '../api/axios';
import type { ApiResponse } from '../types';

interface AvatarUploadProps {
  onUploadSuccess: () => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Kiểm tra định dạng ở client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Chỉ chấp nhận file ảnh định dạng JPEG hoặc PNG.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Giới hạn dung lượng < 2MB ở client (2 * 1024 * 1024 bytes)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg('Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Đóng gói FormData
    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);

    try {
      const response = await api.post<ApiResponse<{ avatarUrl: string }>>(
        '/api/auth/me/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccessMsg(response.data.message || 'Cập nhật avatar thành công!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Tự động refresh thông tin Profile
      onUploadSuccess();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 413
          ? 'Dung lượng file vượt quá giới hạn 2MB (Mã 413)'
          : 'Không thể upload ảnh đại diện');
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
        Đổi ảnh đại diện (Tối đa 2MB, JPEG/PNG):
      </label>
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={loading}
        style={{ fontSize: '14px' }}
      />

      {loading && <p style={{ color: '#0284c7', margin: '6px 0' }}>Đang tải ảnh lên...</p>}
      {errorMsg && <p style={{ color: '#dc2626', margin: '6px 0', fontSize: '14px' }}>⚠️ {errorMsg}</p>}
      {successMsg && <p style={{ color: '#16a34a', margin: '6px 0', fontSize: '14px' }}> {successMsg}</p>}
    </div>
  );
};
