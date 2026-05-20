import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Clock, MapPin, X, Volume2, Heart, MessageCircle, BookMarked } from 'lucide-react';
import { Match, Team, Mall, Translation, Language } from '../../types';

interface FeaturedSliderProps {
  matches: Match[];
  teams: Team[];
  malls: Mall[];
  lang: Language;
  T: Translation;
  onBook: (id: string) => void;
}

export const FeaturedSlider = ({ matches, teams, malls, lang, T, onBook }: FeaturedSliderProps) => {
  const featured = matches.filter(m => m.isFeatured && m.isActive !== false).sort((a, b) => a.timestamp - b.timestamp);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const timerRef = useRef<any>(null);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % featured.length);
    setProgress(0);
    progressRef.current = 0;
  }, [featured.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + featured.length) % featured.length);
    setProgress(0);
    progressRef.current = 0;
  }, [featured.length]);

  useEffect(() => {
    if (featured.length < 2 || fullscreen) return;
    const autoTimer = setInterval(next, 5000);
    return () => clearInterval(autoTimer);
  }, [featured.length, next, fullscreen]);

  useEffect(() => {
    if (!fullscreen) { setProgress(0); return; }
    progressRef.current = 0;
    const start = Date.now();
    const duration = 5000;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      progressRef.current = pct;
      setProgress(pct);
      if (pct >= 1) { next(); }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, [current, fullscreen, next]);

  if (!featured.length) return null;

  const match = featured[current];
  const t1 = teams.find(t => t.id === match.team1Id);
  const t2 = teams.find(t => t.id === match.team2Id);
  const mall = malls.find(m => m.id === match.mallId);
  const now = Date.now();
  const isLive = match.status === 'live' || (match.timestamp <= now && match.timestamp + 10800000 > now);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 400 : -400, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -400 : 400, opacity: 0 }),
  };

  const StoryContent = ({ fs }: { fs: boolean }) => (
    <div className={`relative overflow-hidden ${fs ? 'stories-full' : 'rounded-[2rem] md:rounded-[2.5rem]'} ${fs ? '' : 'cursor-pointer'}`}
      style={fs ? { position: 'fixed', inset: 0, zIndex: 200, borderRadius: 0 } : { aspectRatio: '16/9' }}
      onClick={() => { if (!fs) setFullscreen(true); }}>
      {fs && (
        <div className="absolute top-0 left-0 right-0 z-30 px-3 pt-3 flex gap-1.5">
          {featured.map((_, i) => (
            <div key={i} className="stories-progress">
              <div className="stories-progress-fill" style={{ width: i === current ? `${progress * 100}%` : i < current ? '100%' : '0%' }} />
            </div>
          ))}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent z-10" />
      {match.imageUrl && <img src={match.imageUrl} alt="" className="w-full h-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent mix-blend-overlay z-10" />

      {fs && (
        <div className="absolute top-12 left-4 right-4 z-30 flex items-center justify-between">
          <button onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-xl flex items-center justify-center text-white">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-white text-xs font-bold bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {lang === 'ar' ? `مباشر` : 'LIVE'}
          </div>
        </div>
      )}

      {!fs && (
        <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5">
          {featured.map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${i === current ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      )}

      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={match.id} custom={direction} variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-0 z-10" />
      </AnimatePresence>

      <div className={`absolute ${fs ? 'bottom-24 md:bottom-10 left-4 right-4' : 'bottom-0 left-0 right-0 p-5 md:p-8'} z-20`}>
        {!fs && (
          <div className="flex flex-wrap gap-2 mb-3">
            {isLive && <span className="live-pulse bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full" /> {T.live}</span>}
            {match.isSaudiMatch && <span className="saudi-badge">{T.saudiMatch}</span>}
            {match.isArabMatch && !match.isSaudiMatch && <span className="arab-badge">{T.arabMatches}</span>}
          </div>
        )}
        <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className={`${fs ? 'story-ring' : ''}`}>
              <div className={`${fs ? 'story-ring-inner' : ''} w-8 h-8 md:w-14 md:h-14 flex items-center justify-center`}>
                <div className={`${fs ? 'w-7 h-7 md:w-12 md:h-12' : 'w-full h-full'} rounded-full bg-black/50 border border-white/[0.1] flex items-center justify-center p-1`}>
                  {t1?.logoUrl && <img src={t1.logoUrl} className="w-full h-full object-contain" />}
                </div>
              </div>
            </div>
            <span className={`font-black ${fs ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`}>{lang === 'ar' ? t1?.nameAr : t1?.nameEn}</span>
          </div>
          <span className={`font-black text-primary ${fs ? 'text-lg md:text-2xl' : 'text-sm md:text-lg'}`}>VS</span>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className={`${fs ? 'story-ring' : ''}`}>
              <div className={`${fs ? 'story-ring-inner' : ''} w-8 h-8 md:w-14 md:h-14 flex items-center justify-center`}>
                <div className={`${fs ? 'w-7 h-7 md:w-12 md:h-12' : 'w-full h-full'} rounded-full bg-black/50 border border-white/[0.1] flex items-center justify-center p-1`}>
                  {t2?.logoUrl && <img src={t2.logoUrl} className="w-full h-full object-contain" />}
                </div>
              </div>
            </div>
            <span className={`font-black ${fs ? 'text-base md:text-2xl' : 'text-sm md:text-xl'}`}>{lang === 'ar' ? t2?.nameAr : t2?.nameEn}</span>
          </div>
        </div>
        {!fs && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] md:text-xs font-bold text-neutral-400 mb-3">
            <span className="flex items-center gap-1"><Clock size={12} /> {match.time} AST</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {lang === 'ar' ? mall?.nameAr : mall?.nameEn}</span>
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onBook(match.id); }}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-black text-[9px] md:text-xs uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center gap-2 shadow-xl shadow-primary/20">
          {T.watchNow} <ChevronRight size={14} />
        </button>
      </div>

      {fs && (
        <div className="absolute bottom-4 left-0 right-0 z-30 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="action-btn"><Heart size={16} /></button>
              <button className="action-btn"><MessageCircle size={16} /></button>
              <button className="action-btn"><BookMarked size={16} /></button>
            </div>
            <div className="text-white/60 text-[10px] font-bold">{current + 1}/{featured.length}</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section className="px-0 md:px-6 py-4 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-0">
          <h2 className="text-base md:text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse" />
            {T.stories}
          </h2>
          <div className="hidden md:flex gap-2">
            <button onClick={prev} className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-all rotate-180">
              <ChevronRight size={16} className="text-neutral-400" />
            </button>
            <button onClick={next} className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-all">
              <ChevronRight size={16} className="text-neutral-400" />
            </button>
          </div>
        </div>
        <div className="md:px-0">
          <StoryContent fs={false} />
        </div>
      </div>
      <AnimatePresence>
        {fullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFullscreen(false)}>
            <StoryContent fs={true} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
