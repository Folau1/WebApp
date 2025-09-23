import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
}

export default function FileUpload({ 
  onUpload, 
  accept = "image/*", 
  multiple = true, 
  maxFiles = 10 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    // Фильтруем только изображения
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Пожалуйста, выберите только изображения');
      return;
    }

    if (imageFiles.length > maxFiles) {
      alert(`Максимум ${maxFiles} файлов`);
      return;
    }

    onUpload(imageFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        style={{
          border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? '#f0f9ff' : '#f9fafb',
          transition: 'all 0.2s ease',
          marginBottom: '1rem'
        }}
      >
        <div style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          color: '#6b7280'
        }}>
          📁
        </div>
        <p style={{ 
          margin: '0 0 0.5rem 0', 
          color: '#374151',
          fontSize: '1.125rem',
          fontWeight: '500'
        }}>
          {isDragging ? 'Отпустите файлы здесь' : 'Перетащите изображения сюда'}
        </p>
        <p style={{ 
          margin: 0, 
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          или нажмите для выбора файлов
        </p>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          color: '#9ca3af',
          fontSize: '0.75rem'
        }}>
          Поддерживаются: JPG, PNG, WebP, GIF (максимум {maxFiles} файлов)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {uploading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '0.5rem'
          }}></div>
          <span style={{ color: '#374151' }}>Загрузка изображений...</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
