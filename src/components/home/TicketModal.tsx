import { motion } from 'motion/react';
import { CheckCircle, Trophy, CreditCard, Users, MapPin, Clock, Share2 } from 'lucide-react';
import { Translation, Language, Match, Team, Tournament, Mall, Reservation } from '../../types';

interface TicketModalProps {
  reservation: Reservation;
  T: Translation;
  lang: Language;
  onClose: () => void;
  matches: Match[];
  malls: Mall[];
  teams: Team[];
  tournaments: Tournament[];
}

export const TicketModal = ({ reservation, T, lang, onClose, matches, malls, teams, tournaments }: TicketModalProps) => {
  const match = matches.find(m => m.id === reservation.matchId);
  const mall = malls.find(m => m.id === reservation.mallId);
  const team1 = teams.find(t => t.id === match?.team1Id);
  const team2 = teams.find(t => t.id === match?.team2Id);
  const tournament = tournaments.find(t => t.id === match?.tournamentId);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="relative w-full max-w-sm bg-neutral-900 border border-white/[0.06] rounded-[2rem] overflow-hidden shadow-2xl"
      >
        <div className="bg-primary p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <Trophy size={160} className="absolute -bottom-8 -right-8 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xl">
              <CheckCircle size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">{T.yourReservation}</h3>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-1">#{reservation.serial}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
            <div className="text-center flex-1">
              <img src={team1?.logoUrl} className="w-12 h-12 object-contain mx-auto mb-1.5" />
              <div className="font-black text-[10px] uppercase">{lang === 'ar' ? team1?.nameAr : team1?.nameEn}</div>
            </div>
            <div className="font-black text-sm text-neutral-700">VS</div>
            <div className="text-center flex-1">
              <img src={team2?.logoUrl} className="w-12 h-12 object-contain mx-auto mb-1.5" />
              <div className="font-black text-[10px] uppercase">{lang === 'ar' ? team2?.nameAr : team2?.nameEn}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">{T.venue}</span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <MapPin size={12} className="text-primary" />
                {lang === 'ar' ? mall?.nameAr : mall?.nameEn}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">{T.date}</span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <Clock size={12} className="text-primary" />
                {lang === 'ar' ? match?.dateAr : match?.dateEn} • {match?.time}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">{T.fullName}</span>
              <div className="text-[11px] font-bold uppercase">{reservation.name}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">{T.guests}</span>
              <div className="text-[11px] font-bold">{reservation.guests} {lang === 'ar' ? 'ضيوف' : 'Guests'}</div>
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-primary" />
              <div>
                <div className="text-[8px] font-black uppercase text-neutral-500">{T.seatType}</div>
                <div className="text-xs font-bold uppercase">{T[reservation.placeType as keyof Translation] || reservation.placeType}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] font-black uppercase text-neutral-500">{T.total}</div>
              <div className="text-sm font-bold text-primary">{reservation.price} SAR</div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl font-black text-xs uppercase hover:bg-white/[0.08] transition-all">
            {T.close}
          </button>
          <button className="flex-1 py-3.5 bg-white text-black rounded-2xl font-black text-xs uppercase hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-2">
            <Share2 size={14} />
            {T.shareTicket}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
