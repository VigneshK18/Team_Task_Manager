// src/components/Avatar.jsx
import React from 'react';
import { avatarColor, initials } from '../data/store.js';

export default function Avatar({ user, size = 34 }) {
  if (!user) return null;
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: avatarColor(user.id), flexShrink: 0 }}
      title={user.name}
    >
      {initials(user.name)}
    </div>
  );
}
