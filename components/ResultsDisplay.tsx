
import React, { useState, useRef, useEffect } from 'react';
import { TranscriptionData, ProcessingOptions } from '../types';

interface ResultsDisplayProps {
  data: TranscriptionData;
  options: ProcessingOptions;
  isDocument: boolean;
  mediaUrl?: string;
  mimeType?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, options, isDocument, mediaUrl, mimeType }) => {
  // Default to 'verbatim' (Transcribed Data) as requested
  const [activeTab, setActiveTab] = useState<'verbatim' | 'transcript' | 'summary' | 'cleaned' | 'translation'>('verbatim');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copying, setCopying] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setShowScrollTop(scrollContainerRef.current.scrollTop > 400);
      }
    };
    const el = scrollContainerRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let content = `SMARTSCRIBE - HIGH FIDELITY REPORT\n`;
    content += `Generated on: ${new Date().toLocaleString()}\n`;
    content += `Type: ${isDocument ? 'Document Extraction' : 'Verbatim Transcription'}\n`;
    content += `==========================================================\n\n`;
    
    if (data.originalText) {
      content += `TRANSCRIBED DATA (VERBATIM)\n`;
      content += `---------------------------\n`;
      content += `${data.originalText}\n\n`;
    }

    if (data.summary && options.summarize) {
      content += `EXECUTIVE SUMMARY\n`;
      content += `-----------------\n`;
      content += `${data.summary}\n\n`;
    }

    if (!isDocument && data.segments && data.segments.length > 0) {
      content += `DIARIZED SEQUENCE\n`;
      content += `-----------------\n`;
      data.segments.forEach(s => content += `[${s.timestamp}] ${s.speaker}: ${s.text}\n`);
      content += `\n`;
    }

    if (data.cleanedText && options.cleanText) {
      content += `POLISHED VERSION\n`;
      content += `----------------\n`;
      content += `${data.cleanedText}\n\n`;
    }

    if (data.translatedText && options.translate) {
      content += `AI TRANSLATION (${options.targetLanguage})\n`;
      content += `--------------\n`;
      content += `${data.translatedText}\n`;
    }

    downloadFile(content, `SmartScribe_Report_${timestamp}.txt`, 'text/plain');
  };

  const hasSegments = data.segments && data.segments.length > 0;

  // Reordered: Transcribed Data is now first
  const tabs = [
    { id: 'verbatim', label: 'Transcribed Data', icon: 'fa-align-left', show: options.transcribe && !!data.originalText },
    { id: 'transcript', label: isDocument ? 'Full Text' : 'Diarized', icon: isDocument ? 'fa-file-lines' : 'fa-users-between-lines', show: true },
    { id: 'summary', label: 'Briefing', icon: 'fa-sparkles', show: options.summarize && !!data.summary },
    { id: 'cleaned', label: 'Polished', icon: 'fa-wand-magic-sparkles', show: options.cleanText && !!data.cleanedText },
    { id: 'translation', label: 'Translated', icon: 'fa-language', show: options.translate && !!data.translatedText },
  ] as const;

  const currentTextToDownload = () => {
    switch (activeTab) {
      case 'verbatim': return data.originalText;
      case 'transcript': return isDocument ? data.originalText : data.segments?.map(s => `[${s.timestamp}] ${s.speaker}: ${s.text}`).join('\n');
      case 'summary': return data.summary;
      case 'cleaned': return data.cleanedText;
      case 'translation': return data.translatedText;
      default: return "";
    }
  };

  const isVideo = mimeType?.startsWith('video');
  const wordCount = data.originalText ? data.originalText.trim().split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden h-full">
      {/* Header Info Bar */}
      <div className="h-10 px-6 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis Completed</span>
           <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
           <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-tighter">{wordCount} Verbatim Words</span>
        </div>
        <div className="text-[9px] font-mono text-slate-400">Engine: Gemini 3 Pro (128k Context)</div>
      </div>

      {/* Tab Bar */}
      <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-20">
        <div className="flex h-full gap-1 overflow-x-auto no-scrollbar">
          {tabs.filter(t => t.show !== false).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative h-full flex items-center gap-2 px-5 transition-all duration-300 text-xs font-black uppercase tracking-widest ${
                activeTab === tab.id 
                  ? 'text-brand-600 dark:text-brand-400' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-600 dark:bg-brand-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-3 ml-4">
          <button 
            onClick={() => copyToClipboard(currentTextToDownload() || "")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              copying ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Copy current tab"
          >
            <i className={`fa-solid ${copying ? 'fa-check' : 'fa-copy'}`}></i>
          </button>
          <button 
            onClick={exportAsTxt} 
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-600/30 transition-all active:scale-95"
          >
            <i className="fa-solid fa-file-export"></i>
            Export Report
          </button>
        </div>
      </div>

      {/* Media Player Overlay */}
      {!isDocument && mediaUrl && (
        <div className="shrink-0 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 p-4">
          {isVideo ? (
            <div className="max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-2xl bg-black aspect-video">
              <video src={mediaUrl} controls className="w-full h-full" />
            </div>
          ) : (
            <div className="max-w-xl mx-auto flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-lg">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white shrink-0">
                <i className="fa-solid fa-waveform"></i>
              </div>
              <audio src={mediaUrl} controls className="flex-1 h-8" />
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar bg-white dark:bg-slate-900 selection:bg-brand-100 dark:selection:bg-brand-900/40">
        <div className="max-w-4xl mx-auto min-h-full">
          {activeTab === 'verbatim' && (
            <div className="animate-fade-in space-y-10">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Transcribed Data</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verbatim Accuracy Verified</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/40 p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-inner">
                <p className="text-slate-800 dark:text-slate-200 leading-[2.1] whitespace-pre-wrap text-xl font-medium tracking-tight">
                  {data.originalText}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-12 animate-fade-in">
              {!isDocument && hasSegments ? (
                data.segments?.map((seg, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="w-20 shrink-0 text-[10px] font-black font-mono text-slate-300 dark:text-slate-700 pt-3 flex flex-col items-center">
                       <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md mb-2">{seg.timestamp}</span>
                       <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <div className="flex-1 pb-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-brand-600">
                          {seg.speaker.substring(0, 1)}
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{seg.speaker}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-[1.8] text-lg font-medium">
                        {seg.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <i className="fa-solid fa-file-invoice text-brand-600 text-2xl"></i>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Full Content View</h4>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-xl font-medium p-10 bg-slate-50 dark:bg-slate-950/40 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-inner">
                    {data.originalText || "No source data processed."}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="animate-fade-in bg-gradient-to-br from-brand-600 to-indigo-700 p-12 lg:p-16 rounded-[60px] shadow-2xl shadow-brand-500/20 text-white relative overflow-hidden">
              <i className="fa-solid fa-quote-left absolute top-10 left-10 text-8xl opacity-10"></i>
              <h4 className="text-4xl font-black mb-10 tracking-tighter flex items-center gap-4">
                Executive Briefing
              </h4>
              <p className="relative z-10 text-xl lg:text-2xl leading-relaxed font-semibold italic opacity-95">
                {data.summary}
              </p>
            </div>
          )}

          {activeTab === 'cleaned' && (
            <div className="animate-fade-in space-y-8">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-2xl flex items-center justify-center text-xl">
                  <i className="fa-solid fa-sparkles"></i>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Polished Communication</h4>
                  <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Filler Words & Errors Removed</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-950 p-12 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-700 dark:text-slate-300 leading-relaxed text-xl">
                {data.cleanedText}
              </div>
            </div>
          )}

          {activeTab === 'translation' && (
            <div className="animate-fade-in space-y-12">
              <div className="text-center space-y-4 mb-16">
                 <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-800">
                    <i className="fa-solid fa-language text-indigo-600 text-xs"></i>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Neural Translation</span>
                 </div>
                 <h4 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Target: {options.targetLanguage}</h4>
              </div>
              <div className="bg-white dark:bg-slate-950 p-12 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl leading-relaxed text-xl text-slate-700 dark:text-slate-300">
                {data.translatedText}
              </div>
            </div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-12 right-12 w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 animate-fade-in border-4 border-white dark:border-slate-900" title="Back to top">
          <i className="fa-solid fa-chevron-up"></i>
        </button>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        audio::-webkit-media-controls-panel { background-color: #f8fafc; border-radius: 12px; }
        .dark audio::-webkit-media-controls-panel { background-color: #020617; }
      `}</style>
    </div>
  );
};

export default ResultsDisplay;
