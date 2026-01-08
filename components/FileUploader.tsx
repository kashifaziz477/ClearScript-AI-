
import React, { useRef, useState } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`group relative border-2 border-dashed rounded-[24px] p-10 text-center transition-all duration-300 ${
        disabled 
          ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 cursor-not-allowed' 
          : isDragging
            ? 'bg-brand-50/50 dark:bg-brand-900/10 border-brand-500 shadow-2xl shadow-brand-500/10'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-brand-500/5'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={disabled ? undefined : triggerFileInput}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.ogg,.webm,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center gap-6">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
          disabled 
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' 
            : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 group-hover:scale-110 group-hover:rotate-6'
        }`}>
          <i className={`fa-solid ${isDragging ? 'fa-cloud-arrow-up' : 'fa-microphone-lines'} text-3xl`}></i>
        </div>
        
        <div className="space-y-2">
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {isDragging ? 'Drop it here!' : 'Voice to Text'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4">
            Upload MP3, MP4, WAV, or Documents for AI-powered transcription and analysis.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
          {['MP3', 'MP4', 'WAV', 'M4A', 'PDF', 'DOCX'].map(tag => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
