
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
    
    if (isDocument) {
      content += `CONTENT:\n${data.originalText || ''}\n\n`;
    } else {
      content += `TRANSCRIPT:\n`;
      data.segments?.forEach(s => {
        content += `[${s.timestamp}] ${s.speaker}: ${s.text}\n`;
      });
    }
    downloadFile(content, 'report.txt', 'text/plain');
  };

  const exportAsJson = () => {
    downloadFile(JSON.stringify(data, null, 2), 'report.json', 'application/json');
  };

  const tabs = [
    { id: 'transcript', label: isDocument ? 'Full Text' : 'Transcript', icon: isDocument ? 'fa-file-lines' : 'fa-align-left', show: true },
    { id: 'summary', label: 'Summary', icon: 'fa-list-check', show: !!data.summary },
    { id: 'cleaned', label: isDocument ? 'Grammar Check' : 'Cleaned', icon: isDocument ? 'fa-spell-check' : 'fa-broom', show: !!data.cleanedText },
    { id: 'translation', label: 'Translation', icon: 'fa-language', show: !!data.translatedText },
  ] as const;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[700px] transition-colors">
      <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-1">
            {tabs.filter(t => t.show !== false).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Export:</span>
            <button onClick={exportAsTxt} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors" title="Export TXT">
              <i className="fa-solid fa-file-lines"></i>
            </button>
            <button onClick={exportAsJson} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors" title="Export JSON">
              <i className="fa-solid fa-code"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-800 transition-colors">
        {activeTab === 'transcript' && (
          <div className="space-y-6">
            {isDocument ? (
               <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{data.originalText}</p>
            ) : (
              data.segments?.map((seg, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-20 shrink-0 text-xs font-mono text-slate-400 dark:text-slate-500 pt-1">
                    {seg.timestamp}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight block mb-1">
                      {seg.speaker}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm lg:text-base">
                      {seg.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="prose dark:prose-invert prose-blue max-w-none">
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{isDocument ? 'Document Executive Summary' : 'Meeting Summary'}</h4>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{data.summary}</p>
          </div>
        )}

        {activeTab === 'cleaned' && (
          <div className="prose dark:prose-invert prose-blue max-w-none">
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{isDocument ? 'Polished Content' : 'Cleaned Transcript'}</h4>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{data.cleanedText}</p>
          </div>
        )}

        {activeTab === 'translation' && (
          <div className="prose dark:prose-invert prose-blue max-w-none">
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Translated Output</h4>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{data.translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;
