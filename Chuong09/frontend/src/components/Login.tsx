import React, { useState } from 'react';
import { api, setToken } from '../api/axios';
import type { ApiResponse, LoginData } from '../types';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<ApiResponse<LoginData>>('/api/auth/login', {
        email: email.trim(),
        password,
      });

      const token = response.data.data.accessToken;
      // Lưu token vào bộ nhớ (In-memory)
      setToken(token);

      onLoginSuccess();
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type: 'admin' | 'student') => {
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('Admin@123');
    } else {
      setEmail('an.lab@example.com');
      setPassword('SinhVien@123');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px', color: '#1e293b' }}>Đăng nhập hệ thống</h2>

      {errorMsg && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '14px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nhap-email@example.com"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>
      </form>

      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', fontSize: '13px', color: '#64748b' }}>
        <span>Điền nhanh tài khoản thử nghiệm: </span>
        <button
          type="button"
          onClick={() => handleQuickFill('admin')}
          style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => handleQuickFill('student')}
          style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
        >
          Student
        </button>
      </div>
    </div>
  );
};

