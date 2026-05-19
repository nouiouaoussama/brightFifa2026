import { Sparkles, LayoutDashboard, Trophy } from 'lucide-react';
import { Language, Translation, Theme } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  lang: Language;
  theme: Theme;
  view: string;
  user: FirebaseUser | null;
  T: Translation;
  toggleLang: () => void;
  setView: (view: any) => void;
  setShowAdminLogin: (show: boolean) => void;
}

export const Navbar = ({ lang, theme, view, user, T, toggleLang, setView, setShowAdminLogin }: NavbarProps) => (
  <nav className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 py-3 backdrop-blur-2xl border-b transition-all duration-300 ${theme === 'dark' ? 'bg-neutral-950/70 border-white/[0.04]' : 'bg-white/70 border-black/5'}`}>
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <button className="flex items-center gap-2 md:gap-3 group" onClick={() => setView('landing')}>
        <Trophy size={20} className="md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform" />
        <div className="flex flex-col">
          <span className="font-black text-[9px] md:text-sm tracking-tighter leading-none">
            {lang === 'ar' ? 'بافيليون الخبر' : 'PAVILION ALKHOBAR'}
          </span>
          <span className="text-[6px] md:text-[7px] font-bold text-primary uppercase tracking-[0.3em] opacity-70">
            {lang === 'ar' ? 'كأس العالم 2026' : 'WORLD CUP 2026'}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-2 md:gap-3">
        {view === 'admin' ? (
          <button onClick={() => setView('landing')} className="btn-ghost px-3 py-2 text-[9px]">
            {T.back}
          </button>
        ) : (
          <>
            <button
              onClick={() => document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden sm:block text-[9px] md:text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors"
            >
              {T.schedule}
            </button>
            <button
              onClick={() => user ? setView('admin') : setShowAdminLogin(true)}
              className="p-2 md:p-2.5 bg-white/[0.04] rounded-xl hover:bg-primary transition-all group border border-white/[0.06]"
            >
              <LayoutDashboard size={14} className="md:size-4 text-neutral-500 group-hover:text-white" />
            </button>
          </>
        )}

        <div className="w-px h-5 md:h-6 bg-white/[0.06]" />

        <button
          onClick={toggleLang}
          className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white text-black text-[9px] md:text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
        >
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
      </div>
    </div>
  </nav>
);
