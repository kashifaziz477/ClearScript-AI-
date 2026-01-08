
import React from 'react';
import { ProcessingOptions } from '../types';

interface ProcessingOptionsFormProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  disabled?: boolean;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Portuguese", "Italian", "Hindi", "Arabic"
];

const ProcessingOptionsForm: React.FC<ProcessingOptionsFormProps> = ({ options, setOptions, disabled }) => {
  const toggleOption = (key: keyof ProcessingOptions) => {
    if (disabled) return;
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6 transition-colors">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <i className="fa-solid fa-wand-magic-sparkles text-blue-500"></i>
        AI Enhancement Options
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${options.summarize ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/40'}`}>
          <input 
            type="checkbox" 
            checked={options.summarize} 
            onChange={() => toggleOption('summarize')}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
            disabled={disabled}
          />
          <div>
            <span className="block font-semibold text-slate-800 dark:text-slate-200">Summarization</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Generate a concise executive summary.</span>
          </div>
        </label>

        <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${options.cleanText ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/40'}`}>
          <input 
            type="checkbox" 
            checked={options.cleanText} 
            onChange={() => toggleOption('cleanText')}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
            disabled={disabled}
          />
          <div>
            <span className="block font-semibold text-slate-800 dark:text-slate-200">Text Cleaning</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Remove fillers and fix grammar.</span>
          </div>
        </label>

        <div className={`col-span-full space-y-3 p-4 border rounded-lg transition-colors ${options.translate ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-700'}`}>
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={options.translate} 
              onChange={() => toggleOption('translate')}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
              disabled={disabled}
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Automatic Translation</span>
          </div>
          {options.translate && (
            <div className="ml-7 animate-fade-in">
              <select 
                value={options.targetLanguage}
                onChange={(e) => setOptions(prev => ({ ...prev, targetLanguage: e.target.value }))}
                className="w-full mt-2 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
