import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api/axios';
import type { SinhVien, User, ApiResponse } from '../types';

interface SinhVienTableProps {
  currentUser: User | null;
}

export const SinhVienTable: React.FC<SinhVienTableProps> = ({ currentUser }) => {
  const [sinhViens, setSinhViens] = useState<SinhVien[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deletingMaSV, setDeletingMaSV] = useState<string | null>(null);

  const fetchSinhViens = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.get<ApiResponse<SinhVien[]>>('/api/v1/sinh-vien');
      setSinhViens(response.data.data || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách sinh viên';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSinhViens();
  }, [fetchSinhViens]);

  const handleDelete = async (maSV: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sinh viên "${maSV}" không?`)) {
      return;
    }

    setDeletingMaSV(maSV);
    setActionMsg(null);

    try {
      const response = await api.delete<ApiResponse<null>>(`/api/v1/sinh-vien/${maSV}`);
      setActionMsg({ text: response.data.message || `Đã xóa sinh viên ${maSV} thành công!`, type: 'success' });
      // Tải lại danh sách
      await fetchSinhViens();
    } catch (err: any) {
      const status = err.response?.status;
      let msg = err.response?.data?.message || 'Lỗi khi xóa sinh viên';

      if (status === 401) {
        msg = 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn (Mã 401).';
      } else if (status === 403) {
        msg = 'Từ chối quyền: Bạn không có quyền Admin để thực hiện thao tác xóa này (Mã 403).';
      } else if (status === 404) {
        msg = 'Không tìm thấy sinh viên cần xóa (Mã 404).';
      }

      setActionMsg({ text: msg, type: 'error' });
    } finally {
      setDeletingMaSV(null);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Danh sách sinh viên</h2>
        <button
          onClick={fetchSinhViens}
          disabled={loading}
          style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px' }}
        >
          {loading ? 'Đang tải...' : 'Làm mới danh sách'}
        </button>
      </div>

      {actionMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '14px',
            fontSize: '14px',
            backgroundColor: actionMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: actionMsg.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${actionMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {actionMsg.type === 'success' ? ' ' : '⚠️ '} {actionMsg.text}
        </div>
      )}

      {/* Trạng thái Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
          <p>⏳ Đang tải dữ liệu từ máy chủ...</p>
        </div>
      )}

      {/* Trạng thái Error */}
      {!loading && errorMsg && (
        <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '6px' }}>
          <p>⚠️ {errorMsg}</p>
          <button onClick={fetchSinhViens} style={{ padding: '6px 14px', cursor: 'pointer', marginTop: '8px' }}>
            Thử lại
          </button>
        </div>
      )}

      {/* Trạng thái Empty */}
      {!loading && !errorMsg && sinhViens.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
          <p>Chưa có sinh viên nào trong hệ thống.</p>
        </div>
      )}

      {/* Hiển thị bảng sinh viên */}
      {!loading && !errorMsg && sinhViens.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Mã SV</th>
                <th style={{ padding: '12px' }}>Họ và Tên</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Mã Lớp</th>
                {/* Phân quyền RBAC: Chỉ hiển thị cột Thao tác nếu là Admin */}
                {isAdmin && <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác (RBAC Admin)</th>}
              </tr>
            </thead>
            <tbody>
              {sinhViens.map((sv) => (
                <tr key={sv.maSV} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#2563eb' }}>{sv.maSV}</td>
                  <td style={{ padding: '12px' }}>{sv.hoTen}</td>
                  <td style={{ padding: '12px', color: '#475569' }}>{sv.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '13px' }}>
                      {sv.maLop}
                    </span>
                  </td>
                  {/* Nút Xóa chỉ hiển thị khi role === 'admin' */}
                  {isAdmin && (
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(sv.maSV)}
                        disabled={deletingMaSV === sv.maSV}
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        {deletingMaSV === sv.maSV ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
