
import React from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'free' | 'pro') => void;
  currentPlan: 'free' | 'pro';
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe, currentPlan }) => {
  if (!isOpen) return null;

  const plans = [
    {
      id: 'free',
      name: 'Free Mode',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual transcriptions.',
      features: ['Up to 5 minutes per file', 'Standard Accuracy', 'Basic Diarization', 'Text Export Only'],
      buttonText: currentPlan === 'free' ? 'Current Plan' : 'Switch to Free',
      highlight: false,
    },
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: '$5',
      period: 'per month',
      description: 'Advanced features for individuals.',
      features: ['Unlimited File Length', 'Gemini 3 Pro Engine', 'Deep Audio Analysis', 'Full PDF & DOCX Export', 'Premium Support'],
      buttonText: 'Get Started',
      highlight: true,
      badge: 'Most Flexible'
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: '$50',
      period: 'per year',
      description: 'Best value for professionals.',
      features: ['All Monthly Features', '2 Months Free Included', 'Priority API Access', 'Custom AI Instructions', 'Early Beta Access'],
      buttonText: 'Save 20%',
      highlight: true,
      badge: 'Best Value'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <header className="p-8 lg:p-12 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
          
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
            Choose Your <span className="text-brand-600 dark:text-brand-400 underline decoration-brand-200/50 underline-offset-8">Precision</span> Level
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Unlock the full potential of high-fidelity transcription with our professional tiers.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 pt-0 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative group p-8 rounded-[40px] border transition-all duration-500 flex flex-col h-full ${
                  plan.highlight 
                    ? 'bg-brand-50/30 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800 shadow-xl shadow-brand-500/5 hover:border-brand-500' 
                    : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-600/30">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                    <span className="text-slate-400 dark:text-slate-600 text-sm font-bold">/{plan.period}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand-600/10 dark:bg-brand-400/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="fa-solid fa-check text-[10px]"></i>
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onSubscribe(plan.id === 'free' ? 'free' : 'pro')}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all ${
                    plan.highlight
                      ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/30 hover:bg-brand-700 active:scale-95'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={currentPlan === plan.id}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trusted by over 10,000+ professionals</p>
            <div className="flex justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0">
               <i className="fa-brands fa-google text-2xl"></i>
               <i className="fa-brands fa-microsoft text-2xl"></i>
               <i className="fa-brands fa-apple text-2xl"></i>
               <i className="fa-brands fa-slack text-2xl"></i>
            </div>
          </div>
        </div>
        
        <footer className="p-6 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 text-center">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secure payments powered by Stripe. Cancel anytime.</p>
        </footer>
      </div>
    </div>
  );
};

export default SubscriptionModal;
