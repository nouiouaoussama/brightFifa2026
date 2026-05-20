import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, updateDocument, addDocument, setDocument, subscribeToCollection, subscribeToReservations, checkDuplicateBooking } from './services/firebase';
import { TRANSLATIONS } from './translations';
import { Language, Match, Reservation, Theme, Team, Tournament, Mall, MatchVenueConfig, SeatTier } from './types';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/home/HeroSection';
import { FeaturedSlider } from './components/home/FeaturedSlider';
import { ScheduleSection } from './components/home/ScheduleSection';
import { ReservationSection } from './components/home/ReservationSection';
import { TicketModal } from './components/home/TicketModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ShieldCheck, Globe, Phone, ExternalLink, MapPin, AlertTriangle, X } from 'lucide-react';
import { MATCHES, ALL_TEAMS, WORLD_CUP_2026, ALKHOBAR_PAVILION, DEFAULT_VENUE_CONFIGS } from './data/matches';

const generateSerial = () => 'BST-' + Math.floor(100000 + Math.random() * 900000);
const WA_NUMBER = '213793374471';

const handleWhatsAppBooking = (match: any, mall: any, res: any, lang: Language, teams: Team[]) => {
  const t1 = teams.find(t => t.id === match?.team1Id);
  const t2 = teams.find(t => t.id === match?.team2Id);
  const text = lang === 'ar'
    ? `مرحباً برايت، أود تأكيد حجزي:\n🎫 رقم الحجز: ${res.serial}\n⚽ ${t1?.nameAr} ضد ${t2?.nameAr}\n📍 ${mall?.nameAr || 'بافيليون الخبر'}\n👥 ${res.guests} ضيوف\n💺 ${res.placeType}\n💰 ${res.price} ريال`
    : `Hello Bright, I want to confirm my booking:\n🎫 Order: ${res.serial}\n⚽ ${t1?.nameEn} vs ${t2?.nameEn}\n📍 ${mall?.nameEn || 'Pavilion Alkhobar'}\n👥 ${res.guests} guests\n💺 ${res.placeType}\n💰 ${res.price} SAR`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('dark');
  const [view, setView] = useState<'landing' | 'booking' | 'admin'>('landing');
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [matches, setMatches] = useState<Match[]>(MATCHES);
  const [teams, setTeams] = useState<Team[]>(ALL_TEAMS);
  const [tournaments, setTournaments] = useState<Tournament[]>([WORLD_CUP_2026]);
  const [malls, setMalls] = useState<Mall[]>([ALKHOBAR_PAVILION]);
  const [venueConfigs, setVenueConfigs] = useState<MatchVenueConfig[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedMallId, setSelectedMallId] = useState<string>('');
  const [venueConfigId, setVenueConfigId] = useState<string>('');
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [step, setStep] = useState(1);
  const [bookingFormData, setBookingFormData] = useState({ name: '', phone: '', guests: 1, placeType: 'standard' as SeatTier });
  const [isBooking, setIsBooking] = useState(false);

  const T = useMemo(() => TRANSLATIONS[lang], [lang]);

  const getConfig = useCallback((matchId: string): MatchVenueConfig => {
    const existing = venueConfigs.find(v => v.matchId === matchId);
    return existing || DEFAULT_VENUE_CONFIGS(matchId);
  }, [venueConfigs]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    const unsubMatches = subscribeToCollection('matches', (data) => {
      if (!data.length) return;
      setMatches(prev => {
        const merged = [...prev];
        for (const fb of data) {
          const idx = merged.findIndex(m => m.id === fb.id);
          if (idx >= 0) merged[idx] = { ...merged[idx], ...fb };
          else merged.push(fb as Match);
        }
        return merged;
      });
    });
    const unsubTeams = subscribeToCollection('teams', (data) => {
      if (!data.length) return;
      setTeams(prev => {
        const merged = [...prev];
        for (const fb of data) {
          const idx = merged.findIndex(t => t.id === fb.id);
          if (idx >= 0) merged[idx] = { ...merged[idx], ...fb };
          else merged.push(fb as Team);
        }
        return merged;
      });
    });
    const unsubConfigs = subscribeToCollection('matchVenueConfigs', (data) => { if (data.length) setVenueConfigs(data); });
    return () => { unsubAuth(); unsubMatches(); unsubTeams(); unsubConfigs(); };
  }, []);

  useEffect(() => {
    const isAdmin = user?.email === 'oussama.the.on@gmail.com';
    const unsubRes = subscribeToReservations(user?.uid || null, isAdmin, setReservations);
    return unsubRes;
  }, [user]);

  const handleBooking = useCallback(async () => {
    setBookingError('');
    setDuplicateError('');
    setIsBooking(true);
    if (!selectedMatchId) { setBookingError('Please select a match'); setIsBooking(false); return; }
    const match = matches.find(m => m.id === selectedMatchId);
    if (!match) { setBookingError('Match not found'); setIsBooking(false); return; }

    const effectiveMallId = selectedMallId || match.mallId;
    const config = venueConfigs.find(v => v.matchId === selectedMatchId && v.mallId === effectiveMallId) || DEFAULT_VENUE_CONFIGS(selectedMatchId, effectiveMallId);
    const unitPrice = config.tiers[bookingFormData.placeType]?.price || 50;
    const totalPrice = unitPrice * bookingFormData.guests;

    const isDuplicate = await checkDuplicateBooking(bookingFormData.name, bookingFormData.phone, selectedMatchId);
    if (isDuplicate) {
      setDuplicateError(T.duplicateBooking);
      setIsBooking(false);
      return;
    }

    const serial = generateSerial();
    const configId = `${selectedMatchId}_${effectiveMallId}`;
    const reservationData: Omit<Reservation, 'id'> = {
      ...bookingFormData,
      serial,
      matchId: selectedMatchId,
      mallId: effectiveMallId,
      venueConfigId: configId,
      status: 'pending',
      attendanceStatus: 'not_attended',
      paymentStatus: 'unpaid',
      price: totalPrice,
      createdAt: Date.now(),
      ...(user?.uid ? { userId: user.uid } : {})
    };

    let finalRes: Reservation = { id: 'local_' + serial, ...reservationData };

    try {
      const docRef = await addDocument('reservations', reservationData);
      finalRes = { id: docRef.id, ...reservationData };
    } catch (err: any) {
      console.warn('addDoc failed:', err.message);
      try {
        await setDocument('reservations', serial, reservationData);
        finalRes = { id: serial, ...reservationData };
      } catch (err2: any) {
        console.warn('setDoc also failed:', err2.message);
        setBookingError('⚠️ ' + (err.message || err2.message));
        try {
          const stored = JSON.parse(localStorage.getItem('pendingReservations') || '[]');
          stored.push(reservationData);
          localStorage.setItem('pendingReservations', JSON.stringify(stored));
        } catch (e) {}
      }
    }

    setLastReservation(finalRes);
    setStep(5);
    setIsBooking(false);

    handleWhatsAppBooking(match, malls.find(ml => ml.id === effectiveMallId), finalRes, lang, teams);
  }, [selectedMatchId, selectedMallId, matches, venueConfigs, bookingFormData, user?.uid, malls, lang, teams, T.duplicateBooking]);

  const handleAdminLogin = async () => {
    setAdminError('');
    try {
      const u = await loginWithGoogle();
      if (u?.user) {
        if (u.user.email === 'oussama.the.on@gmail.com') {
          setShowAdminLogin(false);
          setView('admin');
        } else {
          setAdminError('This email is not authorized as admin. Access denied.');
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setAdminError('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAdminError('');
      } else {
        setAdminError(err.message || 'Login failed. Check Firebase configuration.');
      }
    }
  };

  return (
    <div className={`min-h-screen font-cairo transition-colors ${theme === 'dark' ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'} ${lang === 'ar' ? 'rtl' : 'ltr'}`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar
        lang={lang} theme={theme} view={view} user={user} T={T}
        toggleLang={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
        setView={setView} setShowAdminLogin={setShowAdminLogin}
      />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroSection T={T} lang={lang} />
            <FeaturedSlider matches={matches} teams={teams} malls={malls} lang={lang} T={T}
              onBook={(id) => { setSelectedMatchId(id); setSelectedMallId(''); setStep(1); setBookingError(''); setDuplicateError(''); setView('booking'); }} />
            <ScheduleSection T={T} lang={lang} matches={matches} malls={malls}
              tournaments={tournaments} teams={teams} venueConfigs={venueConfigs}
              onBook={(id) => { setSelectedMatchId(id); setSelectedMallId(''); setStep(1); setBookingError(''); setDuplicateError(''); setView('booking'); }} />
          </motion.div>
        )}

        {view === 'booking' && (
          <motion.div key="booking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-24">
            <div className="max-w-4xl mx-auto px-4">
              <button onClick={() => { setStep(1); setSelectedMatchId(null); setSelectedMallId(''); setBookingFormData({ name: '', phone: '', guests: 1, placeType: 'standard' as SeatTier }); setBookingError(''); setDuplicateError(''); setView('landing'); }} className="btn-ghost mb-4 flex items-center gap-2">
                ← {T.back}
              </button>
            </div>
            {bookingError && (
              <div className="max-w-xl mx-auto px-4 mb-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
                  <AlertTriangle size={16} /> {bookingError}
                  <button onClick={() => setBookingError('')} className="ml-auto"><X size={14} /></button>
                </div>
              </div>
            )}
            <ReservationSection
              matches={matches} malls={malls} teams={teams} T={T} lang={lang}
              selectedMatchId={selectedMatchId} onSelectMatch={(id) => { setSelectedMatchId(id); setSelectedMallId(''); setDuplicateError(''); setBookingError(''); }}
              onSubmit={handleBooking} step={step} setStep={setStep}
              formData={bookingFormData} isBooking={isBooking}
              onInputChange={(e: any) => setBookingFormData({ ...bookingFormData, [e.target.name]: e.target.value })}
              venueConfigs={venueConfigs}
              onBackToHome={() => { setStep(1); setView('landing'); setSelectedMatchId(null); setSelectedMallId(''); setBookingFormData({ name: '', phone: '', guests: 1, placeType: 'standard' as SeatTier }); setDuplicateError(''); setBookingError(''); }}
              selectedMallId={selectedMallId}
              onSelectVenue={(mallId) => { setSelectedMallId(mallId); }}
              duplicateError={duplicateError}
              bookingError={bookingError}
            />
          </motion.div>
        )}

        {view === 'admin' && user && (
          <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 px-4 md:px-6 max-w-7xl mx-auto">
            <AdminDashboard
              reservations={reservations} matches={matches} teams={teams}
              tournaments={tournaments} lang={lang} T={T} malls={malls}
              venueConfigs={venueConfigs}
              onUpdateReservation={(id, updates) => updateDocument('reservations', id, updates).catch(e => alert('Error: ' + e.message))}
              onToggleMatch={(id, toggle) => updateDocument('matches', id, { isActive: toggle }).catch(e => alert('Error: ' + e.message))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lastReservation && (
          <TicketModal
            reservation={lastReservation} T={T} lang={lang}
            onClose={() => setLastReservation(null)}
            matches={matches} malls={malls} teams={teams} tournaments={tournaments}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowAdminLogin(false)} />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-white/[0.06] rounded-[2rem] p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
                  <ShieldCheck size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{T.adminLoginTitle}</h3>
                <p className="text-neutral-500 text-[10px] font-bold px-4">{T.adminLoginDesc}</p>
              </div>
              {adminError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-bold">
                  <AlertTriangle size={12} /> {adminError}
                </div>
              )}
              <div className="space-y-3">
                <button onClick={handleAdminLogin}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 shadow-lg">
                  <Globe size={16} /> {T.signInGoogle}
                </button>
                <button onClick={() => setShowAdminLogin(false)}
                  className="w-full py-3 text-neutral-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                  {T.cancelAccess}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-12 md:py-20 border-t border-white/[0.04] px-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg width="24" height="24" className="fill-primary" viewBox="0 0 100 100">
              <path d="M20 20 L50 20 L30 50 L20 50 Z" />
              <path d="M60 20 L90 20 L70 50 L60 50 Z" />
              <path d="M20 60 L80 60 L60 90 L20 90 Z" fillOpacity="0.8" />
            </svg>
            <span className="font-black text-sm md:text-lg uppercase tracking-tighter">BRIGHT STAGE EVENTS</span>
          </div>
          <p className="text-neutral-600 text-[10px] md:text-xs mb-6 leading-relaxed">{T.footerText}</p>
          <div className="flex justify-center gap-3">
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
              className="p-3 bg-white/[0.04] rounded-xl hover:bg-[#25D366] transition-all border border-white/[0.06]">
              <Phone size={14} />
            </a>
            <a href="#" className="p-3 bg-white/[0.04] rounded-xl hover:bg-primary transition-all border border-white/[0.06]">
              <ExternalLink size={14} />
            </a>
            <a href="https://maps.google.com/?q=Alkhobar+Saudi+Arabia" target="_blank" rel="noreferrer"
              className="p-3 bg-white/[0.04] rounded-xl hover:bg-primary transition-all border border-white/[0.06]">
              <MapPin size={14} />
            </a>
          </div>
          <div className="mt-6 flex flex-col items-center gap-1">
            <span className="text-[7px] font-black uppercase text-neutral-700">{T.contactUs}</span>
            <span className="font-black text-primary text-xs md:text-sm tracking-widest">+213 793 37 44 71</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
