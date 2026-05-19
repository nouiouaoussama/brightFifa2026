import { motion } from 'motion/react';
import { Calendar, MapPin, ChevronDown } from 'lucide-react';
import { Translation, Language } from '../../types';

interface HeroSectionProps {
  T: Translation;
  lang: Language;
}

export const HeroSection = ({ T, lang }: HeroSectionProps) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24">
    <div className="absolute inset-0 bg-neutral-950">
      <div className="absolute top-[15%] left-[-15%] w-[70%] h-0.5 bg-primary/20 -rotate-45" />
      <div className="absolute top-[55%] right-[-15%] w-[60%] h-0.5 bg-primary/15 rotate-12" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full" />
    </div>

    <div className="max-w-5xl mx-auto text-center relative z-10">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
          <span className="text-primary font-black tracking-[0.3em] text-[8px] md:text-xs uppercase bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            {lang === 'ar' ? 'كأس العالم 2026' : 'FIFA WORLD CUP 2026'}
          </span>
        </div>

        <h1 className={`${lang === 'ar' ? 'text-5xl md:text-8xl lg:text-[10rem]' : 'text-4xl md:text-7xl lg:text-[9rem]'} font-black tracking-tighter leading-[0.85] mb-4 md:mb-6 uppercase`}>
          {lang === 'ar' ? (
            <>عِش <span className="gradient-text">كأس العالم</span><br /><span className="text-3xl md:text-5xl lg:text-6xl text-neutral-500">في بافيليون الخبر</span></>
          ) : (
            <>LIVE THE <span className="gradient-text">WORLD CUP</span><br /><span className="text-2xl md:text-4xl lg:text-5xl text-neutral-500">AT PAVILION ALKHOBAR</span></>
          )}
        </h1>

        <p className="text-neutral-400 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12 font-medium">
          {T.heroSubtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-12">
          <button
            onClick={() => document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary text-xs md:text-lg px-8 md:px-14 py-4 md:py-6 flex items-center gap-3"
          >
            <Calendar size={18} className="md:size-6" />
            {T.heroCta}
          </button>
          <button className="btn-secondary text-[10px] md:text-base px-6 md:px-10 py-4 md:py-6 flex items-center gap-2">
            <MapPin size={16} className="md:size-5" />
            {lang === 'ar' ? 'الخبر - المملكة العربية السعودية' : 'Alkhobar - Saudi Arabia'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 md:gap-10">
          {[
            { value: '48', label: lang === 'ar' ? 'منتخب' : 'Teams' },
            { value: '104', label: lang === 'ar' ? 'مباراة' : 'Matches' },
            { value: '16', label: lang === 'ar' ? 'شاشة عملاقة' : 'Giant Screens' },
            { value: '3000+', label: lang === 'ar' ? 'مقعد' : 'Seats' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-center">
              <div className="text-xl md:text-3xl lg:text-4xl font-black tracking-tighter gradient-text">{s.value}</div>
              <div className="text-[7px] md:text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em]">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

    <button
      onClick={() => document.getElementById('schedule-section')?.scrollIntoView({ behavior: 'smooth' })}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 text-neutral-600 animate-bounce"
    >
      <ChevronDown size={24} />
    </button>
  </section>
);
