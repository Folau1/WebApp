import { useState } from 'react';
import { mediaApi } from '../lib/api';
import type { Media } from '../types/api';

interface ImageUploadProps {
  productId: string;
  media: Media[];
  onMediaUpdate: (media: Media[]) => void;
}

export default function ImageUpload({ productId, media, onMediaUpdate }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedMedia: Media[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        
        // Get presigned URL
        const { uploadUrl, publicUrl } = await mediaApi.getPresignUrl(
          file.name,
          file.type,
          isVideo ? 'VIDEO' : 'IMAGE'
        );

        // Upload file
        await mediaApi.uploadFile(uploadUrl, file);

        // Create media record
        const newMedia = await mediaApi.create(
          productId,
          publicUrl,
          isVideo ? 'VIDEO' : 'IMAGE',
          media.length + uploadedMedia.length
        );

        uploadedMedia.push(newMedia);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      onMediaUpdate([...media, ...uploadedMedia]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Ошибка при загрузке файлов');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Удалить файл?')) return;

    try {
      await mediaApi.delete(mediaId);
      onMediaUpdate(media.filter(m => m.id !== mediaId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка при удалении файла');
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newMedia = [...media];
    const [removed] = newMedia.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, removed);
    
    onMediaUpdate(newMedia);
    
    try {
      await mediaApi.reorder(newMedia.map(m => m.id));
    } catch (error) {
      console.error('Reorder failed:', error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <label className="label">Медиа файлы</label>
        <div className="flex items-center gap-4">
          <label className="btn btn-secondary cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? 'Загрузка...' : 'Выбрать файлы'}
          </label>
          {uploading && (
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Поддерживаются изображения (JPEG, PNG, WebP, GIF) и видео (MP4, WebM, MOV)
        </p>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <div key={item.id} className="relative group">
              {item.kind === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="relative w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center">
                  <video
                    src={item.url}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                  <div className="relative z-10 text-white">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    onClick={() => handleReorder(index, index - 1)}
                    className="p-1 bg-white rounded text-gray-900 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 bg-red-600 rounded text-white hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                
                {index < media.length - 1 && (
                  <button
                    onClick={() => handleReorder(index, index + 1)}
                    className="p-1 bg-white rounded text-gray-900 hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  Главное
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
