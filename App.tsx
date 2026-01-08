
import React, { useState, useEffect } from 'react';
import { AppStatus, TranscriptionData, ProcessingOptions } from './types';
import { processFile } from './services/geminiService';
import FileUploader from './components/FileUploader';
import ProcessingOptionsForm from './components/ProcessingOptionsForm';
import ResultsDisplay from './components/ResultsDisplay';
import mammoth from 'mammoth';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<TranscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [options, setOptions] = useState<ProcessingOptions>({
    summarize: true,
    translate: false,
    targetLanguage: 'Spanish',
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
    setSelectedFile(file);
    setResults(null);
    setError(null);
    setStatus(AppStatus.IDLE);
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
      let base64: string | null = null;
      let extractedText: string | undefined = undefined;

      if (isWordDoc) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
        if (!extractedText.trim()) {
           throw new Error("Could not extract any text from the Word document.");
        }
      } else {
        base64 = await fileToBase64(selectedFile);
      }

      const data = await processFile(base64, selectedFile.type, options, extractedText);
      setResults(data);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing.');
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setResults(null);
    setError(null);
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 transition-all duration-1000"></div>

      {/* Header */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 glass border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 rotate-3 transition-transform hover:rotate-0">
            <i className="fa-solid fa-feather-pointed text-white text-lg"></i>
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-brand-600 dark:from-white dark:to-brand-400">
            ClearScript AI
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
          >
            <i className={`fa-solid ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <i className="fa-solid fa-user-circle text-2xl"></i>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Config */}
        <aside className="w-80 lg:w-96 shrink-0 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-6 bg-brand-500 rounded-full"></div>
                <h2 className="text-lg font-bold tracking-tight">Step 1: Upload</h2>
              </div>
              
              {!selectedFile ? (
                <FileUploader onFileSelect={handleFileSelect} />
              ) : (
                <div className="group relative bg-white dark:bg-slate-900 border border-brand-500/30 rounded-2xl p-4 shadow-xl shadow-brand-500/5 animate-fade-in transition-all hover:border-brand-500/60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                      <i className={`fa-solid ${isDocument ? 'fa-file-pdf' : 'fa-film'} text-xl`}></i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-slate-800 dark:text-slate-100">{selectedFile.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded uppercase">
                          {isDocument ? 'DOC' : 'MEDIA'}
                        </span>
                        <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={reset} 
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              )}
            </section>

            {selectedFile && (
              <section className="animate-fade-in space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-6 bg-brand-500 rounded-full"></div>
                  <h2 className="text-lg font-bold tracking-tight">Step 2: Config</h2>
                </div>
                
                <ProcessingOptionsForm 
                  options={options} 
                  setOptions={setOptions} 
                  disabled={status === AppStatus.PROCESSING} 
                />
                
                <button
                  onClick={handleProcess}
                  disabled={status === AppStatus.PROCESSING}
                  className={`group relative w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-3 overflow-hidden ${
                    status === AppStatus.PROCESSING 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-brand-600 hover:bg-brand-700 text-white hover:-translate-y-1 active:scale-95'
                  }`}
                >
                  {status === AppStatus.PROCESSING ? (
                    <div className="flex items-center gap-3">
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      <span>AI Analyzing...</span>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span>{isDocument ? 'Analyze Text' : 'Run Transcription'}</span>
                    </>
                  )}
                  {status !== AppStatus.PROCESSING && <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-20"></div>}
                </button>
              </section>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-4 rounded-2xl flex items-start gap-3 animate-shake">
                <i className="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                <div className="text-sm">
                  <h4 className="font-bold text-red-800 dark:text-red-400">Error</h4>
                  <p className="text-red-700 dark:text-red-300/80">{error}</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Workspace Display Area */}
        <section className="flex-1 p-6 lg:p-10 flex flex-col min-w-0 bg-white/30 dark:bg-black/10">
          <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
            {status === AppStatus.PROCESSING ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-12">
                  <div className="w-32 h-32 border-[6px] border-slate-100 dark:border-slate-800 border-t-brand-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`fa-solid ${isDocument ? 'fa-magnifying-glass-chart' : 'fa-brain'} text-4xl text-brand-500 animate-pulse`}></i>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Processing Content</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Gemini AI is parsing your file to generate intelligent insights. This might take a moment depending on length.
                  </p>
                </div>
                <div className="mt-8 w-64 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-600 h-full w-full origin-left animate-[progress_3s_infinite_linear]"></div>
                </div>
              </div>
            ) : results ? (
              <ResultsDisplay data={results} isDocument={isDocument} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] p-12 text-center bg-white/20 dark:bg-slate-900/10 transition-all">
                <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[40px] flex items-center justify-center text-slate-300 dark:text-slate-700 mb-8 rotate-12 transition-transform hover:rotate-0">
                  <i className="fa-solid fa-file-invoice text-6xl"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-400 dark:text-slate-600 tracking-tight">The workspace is empty</h3>
                <p className="text-slate-400 dark:text-slate-600 mt-4 max-w-xs leading-relaxed">
                  Upload a file to begin the AI-powered transcription or analysis process.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <style>{`
        @keyframes progress { 
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default App;
