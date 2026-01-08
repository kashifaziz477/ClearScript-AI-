
import React, { useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
        disabled 
          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-not-allowed' 
          : 'bg-white dark:bg-slate-800 border-blue-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer'
      }`}
      onClick={disabled ? undefined : triggerFileInput}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,video/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        disabled={disabled}
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${disabled ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'}`}>
          <i className="fa-solid fa-file-import text-2xl"></i>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Click to upload media or documents</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Supports Media (MP3, MP4) & Documents (PDF, Word)</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            disabled ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Select File
        </button>
      </div>
    </div>
  );
};

export default FileUploader;
