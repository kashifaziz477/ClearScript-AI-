
import React, { useState } from 'react';
import { TranscriptionData } from '../types';

interface ResultsDisplayProps {
  data: TranscriptionData;
  isDocument: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, isDocument }) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'cleaned' | 'translation'>('transcript');

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsTxt = () => {
    let content = `${isDocument ? 'DOCUMENT' : 'TRANSCRIPTION'} REPORT\n\n`;
    if (data.summary) content += `SUMMARY:\n${data.summary}\n\n`;
    if (isDocument) content += `CONTENT:\n${data.originalText || ''}\n\n`;
    else {
      content += `TRANSCRIPT:\n`;
      data.segments?.forEach(s => content += `[${s.timestamp}] ${s.speaker}: ${s.text}\n`);
    }
    downloadFile(content, 'report.txt', 'text/plain');
  };

  const tabs = [
    { id: 'transcript', label: isDocument ? 'Document' : 'Transcript', icon: isDocument ? 'fa-file-lines' : 'fa-align-left', show: true },
    { id: 'summary', label: 'AI Summary', icon: 'fa-sparkles', show: !!data.summary },
    { id: 'cleaned', label: 'Polished', icon: 'fa-wand-magic', show: !!data.cleanedText },
    { id: 'translation', label: 'Translated', icon: 'fa-language', show: !!data.translatedText },
  ] as const;

  return (
    <div className="flex-1 flex flex-col glass dark:bg-slate-900/60 rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-900/5 dark:shadow-black/20 overflow-hidden animate-fade-in">
      {/* Tab Bar */}
      <div className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/20 backdrop-blur-xl">
        <div className="flex h-full gap-2">
          {tabs.filter(t => t.show !== false).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative h-full flex items-center gap-2 px-4 transition-all duration-300 text-sm font-bold ${
                activeTab === tab.id 
                  ? 'text-brand-600 dark:text-brand-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-1 bg-brand-600 dark:bg-brand-500 rounded-t-full shadow-lg shadow-brand-500/50"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportAsTxt} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-95"
          >
            <i className="fa-solid fa-download"></i>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'transcript' && (
            <div className="space-y-8 animate-fade-in">
              {isDocument ? (
                 <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-lg font-medium tracking-tight">
                      {data.originalText}
                    </p>
                 </div>
              ) : (
                data.segments?.map((seg, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-20 shrink-0 text-[10px] font-black font-mono text-slate-400 dark:text-slate-600 pt-2 tracking-widest bg-slate-50 dark:bg-slate-800/50 h-fit py-1 px-2 rounded-lg text-center">
                      {seg.timestamp}
                    </div>
                    <div className="flex-1 pb-8 border-l-2 border-slate-100 dark:border-slate-800 pl-8 relative">
                      <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-brand-500 transition-colors"></div>
                      <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-2">
                        {seg.speaker}
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-lg font-medium tracking-tight">
                        {seg.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="animate-fade-in bg-brand-50/30 dark:bg-brand-900/10 p-8 rounded-[32px] border border-brand-200/50 dark:border-brand-900/30">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-3">
                <i className="fa-solid fa-sparkles text-brand-500"></i>
                Executive Briefing
              </h4>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-xl font-medium italic">
                {data.summary}
              </p>
            </div>
          )}

          {activeTab === 'cleaned' && (
            <div className="animate-fade-in space-y-4">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <i className="fa-solid fa-wand-magic-sparkles text-brand-500"></i>
                Polished Version
              </h4>
              <div className="bg-white dark:bg-slate-950 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-lg">
                  {data.cleanedText}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'translation' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <i className="fa-solid fa-language text-brand-500"></i>
                  AI Translation
                </h4>
              </div>
              <div className="bg-indigo-600 text-white p-8 rounded-[32px] shadow-2xl shadow-indigo-500/20 leading-relaxed text-xl font-medium">
                {data.translatedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
