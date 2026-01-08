
import React from 'react';
import { ProcessingOptions } from '../types';

interface ProcessingOptionsFormProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  disabled?: boolean;
  isDocument: boolean;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Portuguese", "Italian", "Hindi", "Arabic", "Urdu"
];

const ProcessingOptionsForm: React.FC<ProcessingOptionsFormProps> = ({ options, setOptions, disabled, isDocument }) => {
  const toggleOption = (key: keyof ProcessingOptions) => {
    if (disabled) return;
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Option 1: Core Functionality Toggle */}
      <div className="p-1 bg-slate-100 dark:bg-slate-800/50 rounded-[24px]">
        <div className="bg-white dark:bg-slate-900 rounded-[20px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/20">
              <i className="fa-solid fa-microphone-lines text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-lg">1. Data Capture</h3>
              <p className="text-[11px] text-slate-500 font-medium">Verbatim Conversion Engine</p>
            </div>
          </div>

          <button
            onClick={() => toggleOption('transcribe')}
            disabled={disabled}
            className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all ${
              options.transcribe 
                ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400' 
                : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`fa-solid fa-keyboard ${options.transcribe ? 'opacity-100' : 'opacity-40'}`}></i>
              <span className="text-sm font-black uppercase tracking-widest">Transcribed Data</span>
            </div>
            <i className={`fa-solid ${options.transcribe ? 'fa-circle-check' : 'fa-circle-plus'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Option 2: AI Analysis & Polishing */}
      <div className="p-1 bg-slate-100 dark:bg-slate-800/50 rounded-[24px]">
        <div className="bg-white dark:bg-slate-900 rounded-[20px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight text-lg">2. AI Analysis</h3>
              <p className="text-[11px] text-slate-500 font-medium">Professional Insights & Edits</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => toggleOption('summarize')}
              disabled={disabled}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                options.summarize 
                  ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' 
                  : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fa-solid fa-list-check ${options.summarize ? 'opacity-100' : 'opacity-40'}`}></i>
                <span className="text-xs font-bold">Executive Summary</span>
              </div>
              <i className={`fa-solid ${options.summarize ? 'fa-circle-check' : 'fa-circle-plus'} text-sm`}></i>
            </button>

            <button
              onClick={() => toggleOption('cleanText')}
              disabled={disabled}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                options.cleanText 
                  ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' 
                  : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fa-solid fa-spell-check ${options.cleanText ? 'opacity-100' : 'opacity-40'}`}></i>
                <span className="text-xs font-bold">Grammar & Polish</span>
              </div>
              <i className={`fa-solid ${options.cleanText ? 'fa-circle-check' : 'fa-circle-plus'} text-sm`}></i>
            </button>

            <button
              onClick={() => toggleOption('translate')}
              disabled={disabled}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                options.translate 
                  ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400' 
                  : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fa-solid fa-language ${options.translate ? 'opacity-100' : 'opacity-40'}`}></i>
                <span className="text-xs font-bold">Translation</span>
              </div>
              <i className={`fa-solid ${options.translate ? 'fa-circle-check' : 'fa-circle-plus'} text-sm`}></i>
            </button>
          </div>

          {options.translate && (
            <div className="pt-2 animate-fade-in">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block ml-1">Target Language</label>
              <select 
                value={options.targetLanguage}
                onChange={(e) => setOptions(prev => ({ ...prev, targetLanguage: e.target.value }))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none"
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
    </div>
  );
};

export default ProcessingOptionsForm;
