import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api/axios';
import type { SinhVien, User, ApiResponse, Pagination } from '../types';

interface SinhVienTableProps {
  currentUser: User | null;
}

export const SinhVienTable: React.FC<SinhVienTableProps> = ({ currentUser }) => {
  const [sinhViens, setSinhViens] = useState<SinhVien[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deletingMaSV, setDeletingMaSV] = useState<string | null>(null);

  const fetchSinhViens = useCallback(async (currentPage: number, searchKeyword: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await api.get<ApiResponse<SinhVien[]>>('/api/v1/sinh-vien', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchKeyword,
        },
      });

      setSinhViens(response.data.data || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tải danh sách sinh viên';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSinhViens(page, search);
  }, [page, search, fetchSinhViens]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Khi thay đổi search, quay về trang 1 theo yêu cầu bài học (Trang 11 & 12)
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (maSV: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sinh viên "${maSV}" không?`)) {
      return;
    }

    setDeletingMaSV(maSV);
    setActionMsg(null);

    try {
      const response = await api.delete<ApiResponse<null>>(`/api/v1/sinh-vien/${maSV}`);
      setActionMsg({ text: response.data.message || `Đã xóa sinh viên ${maSV} thành công!`, type: 'success' });
      // Tải lại danh sách trang hiện tại
      await fetchSinhViens(page, search);
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
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>Danh sách sinh viên</h2>

        {/* Form tìm kiếm theo họ tên */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Tìm theo họ tên..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Tìm
          </button>
          {search && (
            <button
              type="button"
              onClick={handleResetSearch}
              style={{ padding: '6px 10px', fontSize: '13px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Hủy
            </button>
          )}
        </form>
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
          <button
            onClick={() => fetchSinhViens(page, search)}
            style={{ padding: '6px 14px', cursor: 'pointer', marginTop: '8px' }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Trạng thái Empty */}
      {!loading && !errorMsg && sinhViens.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
          <p>Chưa có sinh viên nào phù hợp.</p>
        </div>
      )}

      {/* Bảng sinh viên */}
      {!loading && !errorMsg && sinhViens.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Mã SV</th>
                <th style={{ padding: '12px' }}>Họ và Tên</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Mã Lớp</th>
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

      {/* Điều khiển Phân trang (Pagination Bar) */}
      {!loading && pagination && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Tổng số: <strong>{pagination.totalItems}</strong> sinh viên
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              style={{ padding: '5px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            >
              ← Trước
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Trang {pagination.page} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages || loading}
              style={{ padding: '5px 12px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
