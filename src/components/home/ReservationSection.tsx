import { motion, AnimatePresence } from 'motion/react';
import { Phone, Users, ChevronRight, CheckCircle, MapPin, Clock, User, Minus, Plus, Home } from 'lucide-react';
import { Translation, Language, Match, Team, Mall, MatchVenueConfig, SeatTier } from '../../types';

interface ReservationSectionProps {
  matches: Match[];
  malls: Mall[];
  teams: Team[];
  T: Translation;
  lang: Language;
  onSubmit: () => void;
  onSelectMatch: (id: string) => void;
  selectedMatchId: string | null;
  step: number;
  setStep: (step: number) => void;
  formData: any;
  isBooking?: boolean;
  onInputChange: (e: any) => void;
  venueConfigs: MatchVenueConfig[];
  onBackToHome: () => void;
  selectedMallId: string;
  onSelectVenue: (id: string) => void;
  duplicateError: string;
  bookingError: string;
}

export const ReservationSection = ({
  matches, malls, teams, T, lang, onSubmit, onSelectMatch, selectedMatchId,
  step, setStep, formData, isBooking, onInputChange, venueConfigs, onBackToHome,
  selectedMallId, onSelectVenue, duplicateError, bookingError
}: ReservationSectionProps) => {
  const selectedMatch = matches.find(m => m.id === selectedMatchId);
  const selectedMall = malls.find(m => m.id === selectedMallId || m.id === selectedMatch?.mallId);

  const matchConfigs = venueConfigs.filter(v => v.matchId === selectedMatchId);
  const selectedConfig = matchConfigs.find(v => v.mallId === (selectedMallId || selectedMatch?.mallId))
    || matchConfigs[0] || null;

  const defaultPrices: Record<SeatTier, number> = { standard: 50, premium: 150, vip: 350 };
  const currentPrice = selectedConfig?.tiers?.[formData.placeType as SeatTier]?.price || defaultPrices[formData.placeType as SeatTier] || 50;
  const totalPrice = currentPrice * formData.guests;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onSubmit();
  };

  const isStep1Valid = !!selectedMatchId;
  const isStep2Valid = !!selectedMallId;
  const isStep3Valid = formData.guests > 0 && !!formData.placeType;
  const isStep4Valid = formData.name.length > 1 && formData.phone.length > 8;

  const t1 = teams.find(t => t.id === selectedMatch?.team1Id);
  const t2 = teams.find(t => t.id === selectedMatch?.team2Id);

  const totalSteps = 4;

  const incrementGuests = () => {
    const max = selectedConfig?.tiers?.[formData.placeType as SeatTier]
      ? selectedConfig.tiers[formData.placeType as SeatTier].totalSeats - selectedConfig.tiers[formData.placeType as SeatTier].bookedSeats
      : 10;
    if (formData.guests < Math.min(max, 20)) {
      onInputChange({ target: { name: 'guests', value: formData.guests + 1 } });
    }
  };

  const decrementGuests = () => {
    if (formData.guests > 1) {
      onInputChange({ target: { name: 'guests', value: formData.guests - 1 } });
    }
  };

  return (
    <section id="reservation-section" className="px-4 md:px-6 py-16 md:py-20 bg-linear-to-b from-transparent to-black/40">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3 uppercase">{T.reservationTitle}</h2>
          <p className="text-neutral-500 text-sm md:text-base font-medium">{T.reservationSubtitle}</p>
        </div>

        <div className="card-blur p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] max-w-xl mx-auto relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/[0.03] blur-[60px] rounded-full" />

          <div className="flex gap-2 mb-6 md:mb-8 relative z-10">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
              <div key={`s-${s}`} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-white/[0.06]'}`} />
            ))}
          </div>

          {(duplicateError || bookingError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-bold relative z-10">
              <span>⚠</span> {duplicateError || bookingError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{T.selectMatch}</label>
                  <div className="relative">
                    <select className="input-field appearance-none cursor-pointer" value={selectedMatchId || ''}
                      onChange={(e) => { onSelectMatch(e.target.value); }}>
                      <option value="" className="bg-neutral-950">{lang === 'ar' ? 'اختر مباراة' : 'Select a match'}</option>
                      {matches.filter(m => m.isActive !== false).map(m => {
                        const tm1 = teams.find(t => t.id === m.team1Id);
                        const tm2 = teams.find(t => t.id === m.team2Id);
                        return (
                          <option key={m.id} value={m.id} className="bg-neutral-950">
                            {tm1?.nameEn} vs {tm2?.nameEn} - {lang === 'ar' ? m.dateAr : m.dateEn}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {selectedMatch && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>
                        <MapPin size={14} className="inline text-primary mr-1" />
                        {lang === 'ar' ? selectedMall?.nameAr : selectedMall?.nameEn}
                      </span>
                      <span className="text-neutral-500">
                        <Clock size={14} className="inline text-primary mr-1" />
                        {selectedMatch.time} AST
                      </span>
                    </div>
                    <div className="text-[10px] font-bold text-neutral-500">{lang === 'ar' ? selectedMatch.dateAr : selectedMatch.dateEn}</div>
                  </motion.div>
                )}

                <button disabled={!isStep1Valid} onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2 text-xs">
                  {T.nextStep} <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 relative z-10">
                <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{T.selectVenue}</label>
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                  {(matchConfigs.length > 0 ? matchConfigs : venueConfigs.filter(v => v.matchId === selectedMatchId)).map(config => {
                    const mall = malls.find(ml => ml.id === config.mallId);
                    const totalAvail = Object.values(config.tiers).reduce((a, t) => a + (t.totalSeats - t.bookedSeats), 0);
                    const isSelected = selectedMallId === config.mallId;
                    return (
                      <button key={config.id} onClick={() => onSelectVenue(config.mallId)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-neutral-800/60 bg-neutral-900/40 hover:border-neutral-700'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-sm">{lang === 'ar' ? mall?.nameAr : mall?.nameEn}</span>
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-neutral-600'}`}>
                            {isSelected && <CheckCircle size={12} className="text-white" />}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-neutral-500">
                          {totalAvail} {lang === 'ar' ? 'مقعد متاح' : 'seats available'}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 text-xs">{T.back}</button>
                  <button onClick={handleNext} disabled={!isStep2Valid} className="btn-primary flex-[2] text-xs">{T.nextStep}</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 relative z-10">
                <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{T.seatType}</label>
                <div className="space-y-2.5">
                  {(['standard', 'premium', 'vip'] as SeatTier[]).map(tier => {
                    const cfg = selectedConfig?.tiers?.[tier];
                    const price = cfg?.price || defaultPrices[tier];
                    const avail = cfg ? cfg.totalSeats - cfg.bookedSeats : 999;
                    const soldOut = avail <= 0;
                    return (
                      <button key={tier} disabled={soldOut}
                        onClick={() => onInputChange({ target: { name: 'placeType', value: tier } })}
                        className={`seat-option w-full ${formData.placeType === tier ? 'selected' : ''} ${soldOut ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className="seat-check">
                          {formData.placeType === tier && <CheckCircle size={14} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm uppercase">{T[tier]}</span>
                            <span className="font-black text-sm text-primary">{price} SAR</span>
                          </div>
                          <div className="text-[10px] font-bold text-neutral-500 mt-0.5">
                            {avail} {T.seatsRemaining}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest block mb-2">{T.guests}</label>
                  <div className="flex items-center justify-center gap-6 p-3 bg-neutral-900/40 rounded-2xl border border-neutral-800/60">
                    <button onClick={decrementGuests} className="counter-btn"><Minus size={16} /></button>
                    <span className="text-3xl font-black tracking-tighter w-12 text-center">{formData.guests}</span>
                    <button onClick={incrementGuests} className="counter-btn"><Plus size={16} /></button>
                  </div>
                </div>

                <div className="p-5 bg-white/[0.02] rounded-2xl border border-primary/10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase text-neutral-500">{T.price}/{lang === 'ar' ? 'شخص' : 'person'}</span>
                    <span className="text-lg font-black tracking-tighter">{currentPrice} SAR</span>
                  </div>
                  <div className="h-px bg-white/[0.06] my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase">{T.total}</span>
                    <span className="text-2xl md:text-3xl font-black tracking-tighter text-primary">{totalPrice} SAR</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-secondary flex-1 text-xs">{T.back}</button>
                  <button onClick={handleNext} disabled={!isStep3Valid} className="btn-primary flex-[2] text-xs">{T.nextStep}</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5 relative z-10">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{T.fullName}</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                      <input name="name" className="input-field pl-12" placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'} value={formData.name} onChange={onInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{T.phone}</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                      <input name="phone" className="input-field pl-12" placeholder="+966 5X XXX XXXX" value={formData.phone} onChange={onInputChange} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
                  <div className="text-[9px] font-black uppercase text-primary mb-3 tracking-[0.2em]">{T.orderSummary}</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between"><span className="text-neutral-500">{T.match}</span><span className="font-bold">{t1?.nameEn} vs {t2?.nameEn}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">{T.venue}</span><span className="font-bold">{lang === 'ar' ? selectedMall?.nameAr : selectedMall?.nameEn}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">{T.seatType}</span><span className="font-bold uppercase">{T[formData.placeType as keyof Translation] || formData.placeType}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-500">{T.guests}</span><span className="font-bold">{formData.guests}</span></div>
                    <div className="h-px bg-white/[0.06] my-1" />
                    <div className="flex justify-between"><span className="text-neutral-500">{T.total}</span><span className="font-bold text-primary text-sm">{totalPrice} SAR</span></div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="btn-secondary flex-1 text-xs">{T.back}</button>
                  <button onClick={handleNext} disabled={!isStep4Valid || isBooking} className="btn-primary flex-[2] text-xs">
                    {isBooking ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {lang === 'ar' ? 'جاري التاكيد...' : 'CONFIRMING...'}
                      </span>
                    ) : T.confirmBooking}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 relative z-10">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle size={44} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter mb-2">{T.bookingConfirmed}</h3>
                <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">{T.confirmationSent}</p>
                <button onClick={onBackToHome} className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all">
                  <Home size={18} /> {T.backToHome}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
