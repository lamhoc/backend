import React from 'react';
import type { User } from '../types';
import { API_BASE_URL } from '../api/axios';
import { AvatarUpload } from './AvatarUpload';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  onRefreshProfile: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onRefreshProfile }) => {
  // Đường dẫn đầy đủ của avatar từ backend nếu có
  const fullAvatarUrl = user.avatarUrl
    ? `${API_BASE_URL}${user.avatarUrl}`
    : 'https://placehold.co/120x120?text=Avatar';

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <img
            src={fullAvatarUrl}
            alt="Avatar"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #3b82f6',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            onError={(e) => {
              // Fallback nếu ảnh bị lỗi tải
              (e.target as HTMLImageElement).src = 'https://placehold.co/120x120?text=No+Img';
            }}
          />

          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#0f172a' }}>{user.fullName}</h3>
            <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '14px' }}>
              <strong>Email:</strong> {user.email}
            </p>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  backgroundColor: user.role === 'admin' ? '#fef3c7' : '#e0f2fe',
                  color: user.role === 'admin' ? '#b45309' : '#0369a1',
                  border: user.role === 'admin' ? '1px solid #fde68a' : '1px solid #bae6fd',
                }}
              >
                Vai trò: {user.role}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Đăng xuất
        </button>
      </div>

      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        <AvatarUpload onUploadSuccess={onRefreshProfile} />
      </div>
    </div>
  );
};

