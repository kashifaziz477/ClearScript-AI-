
import React from 'react';
import { ProcessingOptions } from '../types';

interface ProcessingOptionsFormProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  disabled?: boolean;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Portuguese", "Italian", "Hindi", "Arabic", "Urdu"
];

const ProcessingOptionsForm: React.FC<ProcessingOptionsFormProps> = ({ options, setOptions, disabled }) => {
  const toggleOption = (key: keyof ProcessingOptions) => {
    if (disabled) return;
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ active, label, description, icon, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${
        active 
          ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-500/50 shadow-lg shadow-brand-500/5' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
        active ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
      }`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold tracking-tight transition-colors ${active ? 'text-brand-900 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>
          {label}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-tight truncate">
          {description}
        </p>
      </div>
      <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors ${active ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-1'}`}></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 gap-3">
        <Toggle 
          active={options.summarize} 
          onClick={() => toggleOption('summarize')}
          label="Summarize"
          description="High-level overview"
          icon="fa-list-check"
        />
        <Toggle 
          active={options.cleanText} 
          onClick={() => toggleOption('cleanText')}
          label="Polish Content"
          description="Fix grammar & flow"
          icon="fa-wand-sparkles"
        />
      </div>

      <div className={`p-4 rounded-2xl border transition-all duration-300 ${
        options.translate 
          ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-500/50' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${options.translate ? 'bg-brand-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <i className="fa-solid fa-language"></i>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Translation</p>
              <p className="text-[11px] text-slate-500">Auto-detect & translate</p>
            </div>
          </div>
          <div 
            onClick={() => toggleOption('translate')}
            className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${options.translate ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${options.translate ? 'translate-x-5' : 'translate-x-1'}`}></div>
          </div>
        </div>
        
        {options.translate && (
          <div className="animate-fade-in">
            <select 
              value={options.targetLanguage}
              onChange={(e) => setOptions(prev => ({ ...prev, targetLanguage: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              disabled={disabled}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingOptionsForm;
