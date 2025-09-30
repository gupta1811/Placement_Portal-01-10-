import React from 'react';

export default function Loading({ fullscreen = false, message = 'Loading...' }) {
  if (fullscreen) {
    return (
      <div className="loading-overlay">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-sm text-secondary">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-4">
        <div className="spinner"></div>
        <p className="text-sm text-secondary">{message}</p>
      </div>
    </div>
  );
}
