
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

      // Handle Word documents by extracting text client-side
      if (isWordDoc) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
        if (!extractedText.trim()) {
           throw new Error("Could not extract any text from the Word document. It might be empty or corrupted.");
        }
      } else {
        base64 = await fileToBase64(selectedFile);
      }

      const data = await processFile(base64, selectedFile.type, options, extractedText);
      setResults(data);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during processing. Please try again.');
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
    <div className="min-h-screen pb-12 transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <i className="fa-solid fa-feather-pointed text-white"></i>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Gemini Scribe Pro</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-slate-600 dark:text-slate-300"
                aria-label="Toggle dark mode"
              >
                <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <span className="hover:text-blue-600 cursor-pointer">Support</span>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                <i className="fa-solid fa-circle-user text-xl text-slate-400"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-8">
            <section className="transition-all duration-300">
              <h2 className="text-2xl font-bold mb-4">
                {selectedFile ? 'Configuration' : 'Upload Content'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {selectedFile 
                  ? 'File detected. Choose your desired output enhancements.' 
                  : 'Upload recordings or documents (PDF/Word) for expert AI analysis.'}
              </p>
              
              {!selectedFile ? (
                <FileUploader onFileSelect={handleFileSelect} />
              ) : (
                <div className="bg-white dark:bg-slate-800 border-2 border-blue-500 rounded-xl p-4 flex items-center justify-between shadow-md animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-lg text-white shadow-sm">
                      <i className={`fa-solid ${isDocument ? 'fa-file-pdf' : (selectedFile.type.startsWith('video') ? 'fa-video' : 'fa-file-audio')}`}></i>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold truncate max-w-[180px]">{selectedFile.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                          {isDocument ? 'Document' : 'Media'}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={reset} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all">
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
                </div>
              )}
            </section>

            {selectedFile && (
              <section className="animate-fade-in space-y-6">
                <ProcessingOptionsForm options={options} setOptions={setOptions} disabled={status === AppStatus.PROCESSING} />
                
                <button
                  onClick={handleProcess}
                  disabled={status === AppStatus.PROCESSING}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                    status === AppStatus.PROCESSING 
                    ? 'bg-blue-400 cursor-not-allowed text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 active:scale-95'
                  }`}
                >
                  {status === AppStatus.PROCESSING ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      {isDocument ? 'Analyze Document' : 'Process Multimedia'}
                    </>
                  )}
                </button>
              </section>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm animate-shake">
                <i className="fa-solid fa-circle-exclamation text-red-500 mt-1"></i>
                <div>
                  <h4 className="font-bold text-red-800 dark:text-red-400">Error</h4>
                  <p className="text-sm text-red-700 dark:text-red-300/80">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            {status === AppStatus.PROCESSING ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-12 text-center">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-100 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`fa-solid ${isDocument ? 'fa-book-open' : 'fa-brain'} text-2xl text-blue-600`}></i>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{isDocument ? 'Analyzing content...' : 'Gemini is listening...'}</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                    {isDocument 
                      ? "We're parsing text, checking grammar, and generating summaries from your document." 
                      : "We're analyzing audio tracks, identifying speakers, and generating your transcription."}
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-1/3 animate-[progress_30s_ease-in-out_infinite]"></div>
                </div>
                <style>{`
                  @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 80%; }
                    100% { width: 95%; }
                  }
                  @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                  .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                  }
                `}</style>
              </div>
            ) : results ? (
              <ResultsDisplay data={results} isDocument={isDocument} />
            ) : selectedFile ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-8 bg-blue-50/40 dark:bg-blue-900/10 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800 p-12 text-center animate-fade-in">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md text-blue-600">
                  <i className={`fa-solid ${isDocument ? 'fa-file-lines' : 'fa-file-audio'} text-4xl`}></i>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Ready to Analyze</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    <strong>{selectedFile.name}</strong> is loaded. 
                    Apply grammar checks or summaries on the left.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-12 text-center opacity-60">
                <i className="fa-solid fa-file-invoice text-5xl text-slate-300 dark:text-slate-600"></i>
                <h3 className="text-xl font-semibold text-slate-400 dark:text-slate-500">Result Preview</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm max-w-[280px]">Results for your media or documents will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-widest">Multimedia & Docs</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Full support for PDF, DOCX, MP3, MP4, and more.</p>
          </div>
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800 py-4 md:py-0 px-4">
            <h4 className="text-sm font-bold uppercase tracking-widest">Grammar & Clean</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered grammar checking and filler removal for perfectly polished text.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-widest">Summary Pro</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Get executive-level summaries from hour-long recordings or 50-page PDFs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
