import { motion } from 'motion/react';
import { MapPin, Clock, Calendar, Users } from 'lucide-react';
import { Language, Translation, Match, Team, Tournament, Mall, MatchVenueConfig } from '../../types';

interface MatchCardProps {
  match: Match;
  lang: Language;
  T: Translation;
  onClick: () => void;
  teams: Team[];
  tournaments: Tournament[];
  mall?: Mall;
  config?: MatchVenueConfig;
}

export const MatchCard = ({ match, lang, T, onClick, teams, tournaments, mall, config }: MatchCardProps) => {
  const team1 = teams.find(t => t.id === match.team1Id);
  const team2 = teams.find(t => t.id === match.team2Id);
  const tournament = tournaments.find(t => t.id === match.tournamentId);

  const totalSeats = config ? Object.values(config.tiers).reduce((a, t) => a + t.totalSeats, 0) : 0;
  const bookedSeats = config ? Object.values(config.tiers).reduce((a, t) => a + t.bookedSeats, 0) : 0;
  const available = totalSeats - bookedSeats;
  const timeRemaining = match.timestamp - Date.now();
  const isSoon = timeRemaining > 0 && timeRemaining < 86400000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={`card-blur card-hover p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex flex-col h-full relative overflow-hidden ${match.isSaudiMatch ? 'border-green-500/20' : ''}`}
    >
      {match.isSaudiMatch && (
        <div className="absolute top-3 left-3 saudi-badge flex items-center gap-1 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {T.saudiMatch}
        </div>
      )}
      {match.isArabMatch && !match.isSaudiMatch && (
        <div className="absolute top-3 left-3 arab-badge z-10">{lang === 'ar' ? 'عربي' : 'ARAB'}</div>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">
              {lang === 'ar' ? tournament?.nameAr : tournament?.nameEn}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-primary">
            <Clock size={10} className="md:size-3" />
            {match.time}
            <span className="text-neutral-600 text-[7px]">AST</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 md:gap-4 mb-4 md:mb-5 flex-1">
        <div className="flex-1 text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/[0.03] rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/[0.06] p-2">
            <img src={team1?.logoUrl} alt={lang === 'ar' ? team1?.nameAr : team1?.nameEn} className="w-full h-full object-contain" loading="lazy" />
          </div>
          <div className="font-black text-[9px] md:text-xs leading-tight">{lang === 'ar' ? team1?.nameAr : team1?.nameEn}</div>
          {match.groupAr && <div className="text-[7px] font-bold text-neutral-600 uppercase">{match.groupAr}</div>}
        </div>
        <div className="text-base md:text-2xl font-black text-neutral-700 uppercase tracking-tighter">VS</div>
        <div className="flex-1 text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/[0.03] rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/[0.06] p-2">
            <img src={team2?.logoUrl} alt={lang === 'ar' ? team2?.nameAr : team2?.nameEn} className="w-full h-full object-contain" loading="lazy" />
          </div>
          <div className="font-black text-[9px] md:text-xs leading-tight">{lang === 'ar' ? team2?.nameAr : team2?.nameEn}</div>
          {match.groupEn && <div className="text-[7px] font-bold text-neutral-600 uppercase">{match.groupEn}</div>}
        </div>
      </div>

      <div className="space-y-3 mt-auto">
        <div className="flex items-center justify-between text-neutral-500 text-[9px] md:text-[10px] font-bold">
          <span className="flex items-center gap-1.5">
            <Calendar size={10} className="md:size-3 text-primary" />
            {lang === 'ar' ? match.dateAr : match.dateEn}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={10} className="md:size-3" />
            {lang === 'ar' ? mall?.nameAr : mall?.nameEn}
          </span>
        </div>

        {config && (
          <div className="flex items-center justify-between text-[8px] font-bold">
            <span className="flex items-center gap-1 text-green-500">
              <Users size={10} /> {available} {lang === 'ar' ? 'متاح' : 'available'}
            </span>
            <span className="text-neutral-600">{bookedSeats} {lang === 'ar' ? 'محجوز' : 'booked'}</span>
          </div>
        )}

        <button
          onClick={onClick}
          className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-xs uppercase transition-all duration-300 ${
            isSoon
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 animate-pulse-slow'
              : 'bg-white/[0.05] border border-white/[0.08] hover:bg-primary hover:text-white hover:border-primary'
          }`}
        >
          {isSoon ? (lang === 'ar' ? 'خلال 24 ساعة' : 'WITHIN 24H') : T.bookNow}
        </button>
      </div>
    </motion.div>
  );
};
