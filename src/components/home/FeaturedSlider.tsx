import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Clock, MapPin } from 'lucide-react';
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

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(c => (c + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(c => (c - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [featured.length, next]);

  if (!featured.length) return null;

  const match = featured[current];
  const t1 = teams.find(t => t.id === match.team1Id);
  const t2 = teams.find(t => t.id === match.team2Id);
  const mall = malls.find(m => m.id === match.mallId);
  const now = Date.now();
  const isLive = match.status === 'live' || (match.timestamp <= now && match.timestamp + 10800000 > now);
  const isEnded = match.status === 'ended' || match.timestamp + 10800000 < now;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };

  return (
    <section className="px-4 md:px-6 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <span className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse" />
            {T.featuredMatches}
          </h2>
          <div className="flex gap-2">
            <button onClick={prev} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-all rotate-180">
              <ChevronRight size={16} className="text-neutral-400" />
            </button>
            <button onClick={next} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-all">
              <ChevronRight size={16} className="text-neutral-400" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]" style={{ aspectRatio: '16/9' }}>
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={match.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer"
              onClick={() => onBook(match.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
              {match.imageUrl && (
                <img src={match.imageUrl} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent mix-blend-overlay z-10" />

              <div className="absolute bottom-0 left-0 right-0 z-20 p-5 md:p-8">
                <div className="flex flex-wrap gap-2 mb-3">
                  {isLive && <span className="bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 animate-pulse"><span className="w-1.5 h-1.5 bg-white rounded-full" /> {T.live}</span>}
                  {isEnded && <span className="bg-neutral-800 text-neutral-400 text-[8px] font-black uppercase px-3 py-1 rounded-full">{T.ended}</span>}
                  {match.isSaudiMatch && <span className="saudi-badge">{T.saudiMatch}</span>}
                  {match.isArabMatch && !match.isSaudiMatch && <span className="arab-badge">{T.arabMatches}</span>}
                </div>

                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-black/50 border border-white/[0.1] flex items-center justify-center p-1">
                      {t1?.logoUrl && <img src={t1.logoUrl} className="w-full h-full object-contain" />}
                    </div>
                    <span className="text-sm md:text-xl font-black">{lang === 'ar' ? t1?.nameAr : t1?.nameEn}</span>
                  </div>
                  <span className="text-sm md:text-lg font-black text-primary">VS</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-black/50 border border-white/[0.1] flex items-center justify-center p-1">
                      {t2?.logoUrl && <img src={t2.logoUrl} className="w-full h-full object-contain" />}
                    </div>
                    <span className="text-sm md:text-xl font-black">{lang === 'ar' ? t2?.nameAr : t2?.nameEn}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] md:text-xs font-bold text-neutral-400">
                  <span className="flex items-center gap-1"><Clock size={12} /> {match.time} AST • {lang === 'ar' ? match.dateAr : match.dateEn}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {lang === 'ar' ? mall?.nameAr : mall?.nameEn}</span>
                </div>

                <button onClick={(e) => { e.stopPropagation(); onBook(match.id); }}
                  className="mt-3 md:mt-4 bg-primary text-white px-5 py-2.5 rounded-xl font-black text-[9px] md:text-xs uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center gap-2 shadow-xl shadow-primary/20">
                  {T.watchNow} <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5">
            {featured.map((_, i) => (
              <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${i === current ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
