import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react'; // Using Lucide for the icon

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const UploadAudio = ({ onUploaded, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadedAudio, setUploadedAudio] = useState(null);

  const uploadFile = async (file) => {
    if (!file) {
      return;
    }

    setMessage('');
    setUploadedAudio(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch(`${API_URL}/api/upload/upload-audio`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Audio upload failed');
      }

      setUploadedAudio({
        audioId: data.audioId,
        url: data.url,
      });
      setMessage(data.message || 'Audio uploaded successfully');
      onUploaded?.({ audioId: data.audioId, url: data.url });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    uploadFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex h-full w-full items-stretch bg-gray-50 rounded-xl">
      <div className="w-full rounded-xl border border-gray-100 bg-white p-4 shadow-md">
        
        {/* Header Section */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-200">
            <UploadCloud size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Upload Audio</h2>
            <p className="text-sm text-slate-500">Upload mp3, wav, m4a and more</p>
          </div>
        </div>

        {/* Dropzone Section */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative group flex min-h-[112px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 transition-all duration-200 hover:border-indigo-500 hover:text-indigo-500
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}
        >
          <p className="mb-2 text-sm font-medium text-slate-600 hover:text-indigo-500">
            Drag and drop your file here
          </p>
          
          <span className="mb-2 text-xs font-light italic text-slate-400 hover:text-indigo-500">or</span>

          <label className="cursor-pointer">
            <input 
              type="file" 
              className="hidden" 
              accept="audio/*" 
              disabled={isUploading}
              onChange={handleFileChange}
            />
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-indigo-500 hover:text-indigo-500">
              {isUploading ? 'Uploading...' : isProcessing ? 'Transcribing...' : 'Browse Files'}
            </div>
          </label>
        </div>

        {message && (
          <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
            uploadedAudio ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            {message}
          </p>
        )}

        {uploadedAudio?.audioId && (
          <div className="mt-2 text-xs text-slate-500">
            Audio ID: <span className="font-semibold text-slate-700">{uploadedAudio.audioId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadAudio;
