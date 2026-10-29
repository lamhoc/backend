import { useState, useCallback } from 'react';
import { api, setToken, getToken } from './api/axios';
import type { User, ApiResponse } from './types';
import { Login } from './components/Login';
import { Profile } from './components/Profile';
import { SinhVienTable } from './components/SinhVienTable';
import './App.css';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // Tải thông tin hồ sơ người dùng hiện tại bằng Bearer token
  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    setLoadingProfile(true);
    try {
      const response = await api.get<ApiResponse<User>>('/api/auth/profile');
      setUser(response.data.data);
    } catch (err: any) {
      console.warn('Không thể lấy thông tin profile, đăng xuất:', err);
      setToken(null);
      setUser(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const handleLoginSuccess = async () => {
    await fetchProfile();
  };

  const handleLogout = () => {
    // Xóa token trong memory
    setToken(null);
    setUser(null);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
      <header style={{ marginBottom: '28px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
        <h1 style={{ margin: 0, color: '#1e3a8a', fontSize: '28px' }}>
          Hệ thống Quản lý Sinh viên - Chương 07
        </h1>
        <p style={{ margin: '6px 0 0 0', color: '#64748b' }}>
          Tích hợp Frontend React + Vite + Axios & Backend Express (JWT, RBAC, Multer Avatar)
        </p>
      </header>

      {/* Khu vực Xác thực: Đăng nhập hoặc Thông tin hồ sơ */}
      <section style={{ marginBottom: '24px' }}>
        {loadingProfile ? (
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <p>Đang tải thông tin tài khoản...</p>
          </div>
        ) : user ? (
          <Profile
            user={user}
            onLogout={handleLogout}
            onRefreshProfile={fetchProfile}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </section>

      {/* Khu vực Bảng Danh sách Sinh viên */}
      <section>
        <SinhVienTable currentUser={user} />
      </section>
    </div>
  );
}

export default App;
