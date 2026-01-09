
import React, { useState, useEffect, useRef } from 'react';
import { AppStatus, TranscriptionData, ProcessingOptions } from './types';
import { processFile } from './services/geminiService';
import FileUploader from './components/FileUploader';
import ProcessingOptionsForm from './components/ProcessingOptionsForm';
import ResultsDisplay from './components/ResultsDisplay';
import SubscriptionModal from './components/SubscriptionModal';
import mammoth from 'mammoth';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [results, setResults] = useState<TranscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Subscription State
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);

  // Streaming states
  const [partialTranscript, setPartialTranscript] = useState<string>("");
  const [processProgress, setProcessProgress] = useState<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<ProcessingOptions>({
    transcribe: true,
    summarize: true,
    translate: false,
    targetLanguage: 'English',
    cleanText: true,
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (status === AppStatus.PROCESSING) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [partialTranscript, status]);

  const isWordDoc = selectedFile ? (
    selectedFile.type.includes('officedocument') || 
    selectedFile.type.includes('msword') ||
    selectedFile.name.endsWith('.docx') ||
    selectedFile.name.endsWith('.doc')
  ) : false;

  const isDocument = selectedFile ? (
    isWordDoc ||
    selectedFile.type.includes('pdf') || 
    selectedFile.type.includes('text')
  ) : false;

  const handleFileSelect = (file: File) => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setSelectedFile(file);
    setMediaUrl(URL.createObjectURL(file));
    setResults(null);
    setError(null);
    setStatus(AppStatus.IDLE);
    setPartialTranscript("");
    setProcessProgress(0);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);
      setPartialTranscript("");
      setProcessProgress(0);

      let base64: string | null = null;
      let extractedText: string | undefined = undefined;

      if (isWordDoc) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        base64 = await fileToBase64(selectedFile);
      }

      const data = await processFile(
        base64, 
        selectedFile.type, 
        options, 
        (partial, progress) => {
          setPartialTranscript(partial);
          setProcessProgress(progress);
        },
        extractedText
      );
      
      setResults(data);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing.');
      setStatus(AppStatus.ERROR);
    }
  };

  const wordCount = partialTranscript ? partialTranscript.trim().split(/\s+/).length : 0;

  const reset = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setSelectedFile(null);
    setMediaUrl(null);
    setResults(null);
    setError(null);
    setStatus(AppStatus.IDLE);
    setPartialTranscript("");
    setProcessProgress(0);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 font-inter">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-100/30 via-transparent to-transparent dark:from-brand-900/10 pointer-events-none"></div>

      <header className="h-16 shrink-0 flex items-center justify-between px-6 glass border-b border-slate-200/60 dark:border-slate-800/60 z-50">
        <div className="flex items-center gap-3">
          {/* Logo Container */}
          <div className="relative group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-11 h-11 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 transition-all duration-500 group-hover:rotate-12 group-hover:scale-105 overflow-hidden">
               <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700"></div>
               <i className="fa-solid fa-pen-nib text-white text-lg relative z-10 translate-y-[1px] -translate-x-[1px]"></i>
               <div className="absolute bottom-1 right-1 w-4 h-4 bg-white/20 rounded-full blur-[2px]"></div>
            </div>
            {/* Animated Ring */}
            <div className="absolute -inset-1 border border-brand-500/20 rounded-2xl animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-600 to-indigo-600 dark:from-white dark:via-brand-400 dark:to-indigo-400">
                SmartScribe
              </span>
              {isPro && (
                <span className="px-2 py-0.5 bg-amber-400 text-black text-[10px] font-black rounded-md uppercase tracking-wider animate-pulse shadow-sm shadow-amber-500/50">Pro</span>
              )}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-indigo-500 dark:text-brand-400 -mt-0.5 opacity-90 flex items-center gap-1.5">
               <span className="w-1 h-1 bg-current rounded-full"></span>
               AI Transcription Intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSubscriptionModalOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isPro 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700' 
                : 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:scale-95'
            }`}
          >
            {isPro ? 'Manage Plans' : 'Go Pro'}
          </button>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="w-full lg:w-96 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm z-40 lg:h-full">
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-500 rounded-full"></div>
                  <h2 className="text-lg font-bold tracking-tight">Source Data</h2>
                </div>
                {selectedFile && <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full">Ready</span>}
              </div>
              
              {!selectedFile ? (
                <FileUploader onFileSelect={handleFileSelect} disabled={status === AppStatus.PROCESSING} />
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-brand-500/20 rounded-2xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-none animate-fade-in relative group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-600/10 dark:bg-brand-600/20 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                      <i className={`fa-solid ${isDocument ? 'fa-file-lines' : (selectedFile.type.startsWith('video') ? 'fa-video' : 'fa-file-audio')} text-xl`}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-sm">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                    </div>
                    <button onClick={reset} disabled={status === AppStatus.PROCESSING} className="p-2 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30">
                      <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {selectedFile && (
              <section className="animate-fade-in space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-lg font-bold tracking-tight">AI Configuration</h2>
                </div>
                
                <ProcessingOptionsForm 
                  options={options} 
                  setOptions={setOptions} 
                  disabled={status === AppStatus.PROCESSING} 
                  isDocument={isDocument}
                />
                
                <button
                  onClick={handleProcess}
                  disabled={status === AppStatus.PROCESSING}
                  className={`group w-full py-5 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 overflow-hidden relative ${
                    status === AppStatus.PROCESSING 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {status === AppStatus.PROCESSING ? (
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                  ) : (
                    <i className="fa-solid fa-bolt-lightning animate-bounce"></i>
                  )}
                  <span>{status === AppStatus.PROCESSING ? 'Initializing AI...' : 'Verify & Transcribe'}</span>
                </button>
              </section>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-start gap-3 animate-shake">
                <i className="fa-solid fa-triangle-exclamation text-red-500 mt-1"></i>
                <div className="text-sm">
                  <h4 className="font-bold text-red-800 dark:text-red-400">Accuracy Warning</h4>
                  <p className="text-red-700 dark:text-red-300/80 leading-snug">{error}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0 bg-slate-100/30 dark:bg-black/20 p-4 lg:p-8 h-full overflow-hidden">
          <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full h-full relative">
            {status === AppStatus.PROCESSING ? (
              <div className="flex-1 flex flex-col animate-fade-in h-full gap-6">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-none">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                       <svg className="w-16 h-16 transform -rotate-90">
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * processProgress) / 100} className="text-brand-600 transition-all duration-500 ease-out" />
                       </svg>
                       <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-brand-600">
                         {processProgress}%
                       </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Processing Stream</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">High-Precision Mode Active</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Current Output</span>
                    <div className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-mono font-bold">
                      {wordCount} words captured
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-slate-950 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col font-mono">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 text-brand-400 text-[10px] font-black uppercase tracking-widest">
                      <i className="fa-solid fa-terminal"></i>
                      Live Transcription Feed
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] text-slate-500 uppercase font-black">Recording Data</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar text-slate-300 leading-relaxed text-sm sm:text-base pr-4 selection:bg-brand-500 selection:text-white">
                    {partialTranscript ? (
                      <div className="space-y-4">
                        <p className="whitespace-pre-wrap">
                          {partialTranscript}
                          <span className="inline-block w-2.5 h-5 ml-1 bg-brand-500/80 animate-pulse align-middle"></span>
                        </p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <i className="fa-solid fa-satellite-dish text-4xl animate-bounce"></i>
                        <p className="italic text-xs font-bold tracking-widest uppercase">Initializing Neural Core...</p>
                      </div>
                    )}
                    <div ref={transcriptEndRef} />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    <span>Target: Verbatim Accuracy</span>
                    <span>Gemini 3 Pro Engine</span>
                  </div>
                </div>
              </div>
            ) : results ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-fade-in h-full">
                <ResultsDisplay 
                  data={results} 
                  options={options}
                  isDocument={isDocument} 
                  mediaUrl={mediaUrl || undefined}
                  mimeType={selectedFile?.type}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[48px] p-12 text-center bg-white/20 dark:bg-slate-900/10 h-full group">
                <div className="w-40 h-40 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-800 mb-10 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border border-slate-100 dark:border-slate-800">
                  <i className="fa-solid fa-wave-square text-7xl text-brand-600/20 group-hover:text-brand-600/40 transition-colors"></i>
                </div>
                <h3 className="text-4xl font-black text-slate-300 dark:text-slate-700 tracking-tighter mb-4">Precision Audio Intelligence</h3>
                <p className="text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed text-sm font-medium">
                  Upload your recordings or documents to begin a high-fidelity verbatim transcription session.
                </p>
                <div className="mt-10 flex gap-4 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <i className="fa-solid fa-check-double text-brand-600 text-xs"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Verbatim</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                    <i className="fa-solid fa-shield-halved text-brand-600 text-xs"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={(plan) => {
          setIsPro(plan !== 'free');
          setIsSubscriptionModalOpen(false);
        }}
        currentPlan={isPro ? 'pro' : 'free'}
      />
    </div>
  );
};

export default App;
