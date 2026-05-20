import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Users, MapPin, Database, CheckCircle,
  XCircle, Phone, Calendar, Clock, Plus,
  Globe, Trophy, ShieldCheck, Upload, Trash2,
  DollarSign, UserCheck, Ticket, Edit3, Save, X,
  FileSpreadsheet, Archive, RotateCcw, Tag, PenSquare, CalendarDays,
  Building2, History, Activity, CreditCard, Download, Filter
} from 'lucide-react';
import { Translation, Language, Match, Team, Tournament, Mall, Reservation, MatchVenueConfig, SeatTier } from '../../types';
import { updateDocument, addDocument, deleteDocument, setDocument, seedInitialData, bulkImportMatches, importFromCsv, syncLocalReservations, testFirestoreConnection } from '../../services/firebase';
import { MATCHES, ALL_TEAMS, WORLD_CUP_2026, ALKHOBAR_PAVILION } from '../../data/matches';

interface AdminDashboardProps {
  reservations: Reservation[];
  matches: Match[];
  teams: Team[];
  tournaments: Tournament[];
  malls: Mall[];
  venueConfigs: MatchVenueConfig[];
  onUpdateReservation: (id: string, updates: any) => void;
  onToggleMatch: (id: string, toggle: boolean) => void;
  lang: Language;
  T: Translation;
}

export const AdminDashboard = ({
  reservations, matches, teams, tournaments, malls, venueConfigs,
  onUpdateReservation, onToggleMatch, lang, T
}: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'history' | 'matches' | 'venues' | 'system'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMatchId, setFilterMatchId] = useState('all');
  const [filterArchive, setFilterArchive] = useState<'active' | 'archived' | 'all'>('active');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editTiers, setEditTiers] = useState<any>(null);
  const [bulkJson, setBulkJson] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editReservation, setEditReservation] = useState<Reservation | null>(null);
  const [editResForm, setEditResForm] = useState({ placeType: '' as SeatTier | '', guests: 1 });
  const [editMatchId, setEditMatchId] = useState<string | null>(null);
  const [editMatchForm, setEditMatchForm] = useState<any>(null);

  const [diagResult, setDiagResult] = useState<{ ok: boolean; message: string; dbId: string } | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const [newVenue, setNewVenue] = useState({ nameAr: '', nameEn: '', cityAr: '', cityEn: '' });

  useEffect(() => {
    syncLocalReservations().then(n => {
      if (n > 0) console.log(`Auto-synced ${n} local reservations`);
    });
  }, []);

  const [newMatch, setNewMatch] = useState({
    team1Id: '', team2Id: '', dateEn: '', dateAr: '',
    time: '', groupEn: '', groupAr: '', isFeatured: false
  });

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) || r.serial?.includes(searchQuery);
    const matchesFilter = filterMatchId === 'all' || r.matchId === filterMatchId;
    const archiveFilter = filterArchive === 'all' ||
      (filterArchive === 'archived' && r.archived) ||
      (filterArchive === 'active' && !r.archived);
    const createdAt = r.createdAt || 0;
    const fromFilter = !dateFrom || createdAt >= new Date(dateFrom).getTime();
    const toFilter = !dateTo || createdAt <= new Date(dateTo).getTime() + 86400000;
    return matchesSearch && matchesFilter && archiveFilter && fromFilter && toFilter;
  });

  const historyReservations = [...reservations]
    .filter(r => r.archived)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const totalRevenue = reservations.reduce((a, r) => a + (r.paymentStatus === 'paid' ? r.price : 0), 0);
  const pendingRevenue = reservations.reduce((a, r) => a + (r.paymentStatus === 'unpaid' ? r.price : 0), 0);
  const totalGuests = reservations.reduce((a, r) => a + r.guests, 0);
  const checkins = reservations.filter(r => r.attendanceStatus === 'attended').length;
  const totalReservations = reservations.filter(r => !r.archived).length;
  const archivedCount = reservations.filter(r => r.archived).length;

  const seedData = async () => {
    try {
      await seedInitialData(ALL_TEAMS, MATCHES, WORLD_CUP_2026, ALKHOBAR_PAVILION);
      alert('Data seeded successfully!');
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const matchId = `m_${Date.now()}`;
      const timestamp = new Date(`2026 ${newMatch.dateEn}`).getTime() || Date.now();
      await setDocument('matches', matchId, {
        ...newMatch, id: matchId, tournamentId: 'wc2026', mallId: 'p1',
        isActive: true, status: 'upcoming', timestamp
      });
      const configId = `${matchId}_p1`;
      await setDocument('matchVenueConfigs', configId, {
        id: configId, matchId, mallId: 'p1',
        tiers: { standard: { price: 50, totalSeats: 2000, bookedSeats: 0 },
                 premium: { price: 150, totalSeats: 500, bookedSeats: 0 },
                 vip: { price: 350, totalSeats: 100, bookedSeats: 0 } }
      });
      setShowAddMatch(false);
      setNewMatch({ team1Id: '', team2Id: '', dateEn: '', dateAr: '', time: '', groupEn: '', groupAr: '', isFeatured: false });
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const venueId = `v_${Date.now()}`;
      await setDocument('malls', venueId, {
        id: venueId,
        nameAr: newVenue.nameAr,
        nameEn: newVenue.nameEn,
        cityAr: newVenue.cityAr || newVenue.nameAr,
        cityEn: newVenue.cityEn || newVenue.nameEn,
        logoUrl: '',
        mapsUrl: ''
      });
      setShowAddVenue(false);
      setNewVenue({ nameAr: '', nameEn: '', cityAr: '', cityEn: '' });
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const handleBulkImport = async () => {
    try {
      const data = JSON.parse(bulkJson);
      if (!Array.isArray(data)) throw new Error('Must be an array');
      await bulkImportMatches(data, 'p1');
      setBulkJson('');
      alert('Bulk import successful!');
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const handleCsvImport = async () => {
    if (!csvFile) return;
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        return headers.reduce((obj: any, h, i) => { obj[h] = vals[i]; return obj; }, {});
      });
      await importFromCsv(data, 'p1', 'wc2026');
      setCsvFile(null);
      alert(`Imported ${data.length} matches!`);
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const startEditConfig = (config: MatchVenueConfig) => {
    setEditingConfig(config.id);
    setEditTiers(JSON.parse(JSON.stringify(config.tiers)));
  };

  const saveConfig = async () => {
    if (!editingConfig || !editTiers) return;
    try {
      await updateDocument('matchVenueConfigs', editingConfig, { tiers: editTiers });
      setEditingConfig(null);
      setEditTiers(null);
    } catch (err: any) { alert('Error: ' + err.message); }
  };

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
    <div className="card-blur p-4 md:p-5 rounded-2xl md:rounded-3xl">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} className="text-neutral-600" />
        <div className="text-[8px] md:text-[10px] font-black uppercase text-neutral-500">{label}</div>
      </div>
      <div className={`text-lg md:text-2xl font-black tracking-tighter ${color}`}>{value}</div>
    </div>
  );

  const TabButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase whitespace-nowrap transition-all ${
        activeTab === id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/[0.04] text-neutral-500 hover:text-white border border-white/[0.06]'
      }`}>
      <Icon size={12} className="md:size-14" /> {label}
    </button>
  );

  const renderReservationRow = (res: Reservation) => {
    const m = matches.find(mx => mx.id === res.matchId);
    const t1 = teams.find(t => t.id === m?.team1Id);
    const t2 = teams.find(t => t.id === m?.team2Id);
    return (
      <div key={res.id} className={`card-blur p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
        res.archived ? 'border-neutral-800/40 opacity-70' : 'border-white/[0.04] hover:border-primary/20'
      }`}>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex flex-col items-center justify-center border shrink-0 ${
              res.attendanceStatus === 'attended' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-white/[0.04] border-white/[0.06] text-neutral-500'
            }`}>
              <span className="text-xs md:text-sm font-black">{res.guests}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <h4 className="font-black text-[10px] md:text-xs uppercase truncate">{res.name}</h4>
                <span className="text-[6px] font-bold text-neutral-600 bg-white/[0.04] px-1.5 py-0.5 rounded-full shrink-0">#{res.serial}</span>
                {res.archived && <span className="text-[6px] font-black text-neutral-600 bg-neutral-800/40 px-1.5 py-0.5 rounded-full uppercase">{T.archived}</span>}
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[7px] md:text-[8px] font-bold text-neutral-500">
                <span className="flex items-center gap-1"><Phone size={7} /> {res.phone}</span>
                <span className="text-white/60">{t1?.nameEn} vs {t2?.nameEn}</span>
                <span className="text-primary/60 uppercase">{res.placeType}</span>
                <span className="text-white/70">{res.price} SAR</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={() => { setEditReservation(res); setEditResForm({ placeType: res.placeType, guests: res.guests }); }}
              className="p-1.5 md:p-2 bg-white/[0.04] rounded-lg md:rounded-xl border border-white/[0.06] hover:border-primary/30 hover:text-primary transition-all">
              <Edit3 size={10} className="md:size-[11px]" />
            </button>
            <button onClick={() => onUpdateReservation(res.id!, { paymentStatus: res.paymentStatus === 'paid' ? 'unpaid' : 'paid' })}
              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${
                res.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-white/[0.04] text-neutral-500 border border-white/[0.06] hover:text-green-500'
              }`}>
              <DollarSign size={10} className="md:size-[11px]" />
            </button>
            <button onClick={() => onUpdateReservation(res.id!, { attendanceStatus: res.attendanceStatus === 'attended' ? 'not_attended' : 'attended' })}
              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${
                res.attendanceStatus === 'attended' ? 'bg-primary text-white' : 'bg-white/[0.04] text-neutral-500 border border-white/[0.06] hover:text-primary'
              }`}>
              <UserCheck size={10} className="md:size-[11px]" />
            </button>
            <button onClick={() => onUpdateReservation(res.id!, { archived: !res.archived })}
              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl border transition-all ${
                res.archived ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/[0.04] border-white/[0.06] text-neutral-500 hover:text-amber-500'
              }`}>
              {res.archived ? <RotateCcw size={10} className="md:size-[11px]" /> : <Archive size={10} className="md:size-[11px]" />}
            </button>
            <a href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
              className="p-1.5 md:p-2 bg-white/[0.04] rounded-lg md:rounded-xl border border-white/[0.06] hover:bg-[#25D366] hover:text-white transition-all">
              <Phone size={10} className="md:size-[11px]" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-32">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        <StatCard icon={Ticket} label={T.bookings} value={String(totalReservations)} color="text-white" />
        <StatCard icon={Users} label={T.totalGuests} value={String(totalGuests)} color="text-white" />
        <StatCard icon={DollarSign} label={T.totalRevenue} value={`${totalRevenue.toLocaleString()} SAR`} color="text-green-500" />
        <StatCard icon={Clock} label={T.pendingPayments} value={`${pendingRevenue.toLocaleString()} SAR`} color="text-yellow-500" />
        <StatCard icon={UserCheck} label={T.checkins} value={String(checkins)} color="text-primary" />
        <StatCard icon={Archive} label={T.archived} value={String(archivedCount)} color="text-amber-500" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <TabButton id="overview" icon={Activity} label={lang === 'ar' ? 'نظرة عامة' : 'Overview'} />
        <TabButton id="bookings" icon={Ticket} label={T.bookings} />
        <TabButton id="history" icon={History} label={lang === 'ar' ? 'السجل' : 'History'} />
        <TabButton id="matches" icon={Trophy} label={T.matches} />
        <TabButton id="venues" icon={Building2} label={T.manageVenues} />
        <TabButton id="system" icon={Database} label={T.system} />
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="card-blur p-4 md:p-6 rounded-2xl md:rounded-3xl">
              <h3 className="text-xs md:text-sm font-black uppercase mb-4 flex items-center gap-2">
                <Activity size={14} className="text-primary" /> {lang === 'ar' ? 'آخر الحجوزات' : 'Recent Bookings'}
              </h3>
              <div className="space-y-2">
                {reservations.filter(r => !r.archived).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5).map(renderReservationRow)}
                {reservations.filter(r => !r.archived).length === 0 && (
                  <div className="text-center py-8 text-neutral-600 text-xs font-bold">{T.noReservations}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 md:space-y-4">
            {/* Smart Filter Bar */}
            <div className="card-blur p-3 md:p-4 rounded-2xl md:rounded-3xl space-y-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={13} />
                  <input placeholder={lang === 'ar' ? 'بحث بالاسم، الهاتف، الرقم...' : 'Search name, phone, serial...'}
                    className="w-full bg-neutral-800/60 border border-neutral-700/50 rounded-xl pl-8 pr-3 py-2.5 text-[10px] md:text-xs font-bold focus:outline-none focus:border-primary focus:bg-neutral-800/80 transition-all placeholder:text-neutral-500"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2.5 text-[10px] md:text-xs font-bold focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer text-white"
                  value={filterMatchId} onChange={e => setFilterMatchId(e.target.value)}>
                  <option value="all" className="bg-neutral-950">{lang === 'ar' ? 'كل المباريات' : 'All Matches'}</option>
                  {matches.map(m => {
                    const t1 = teams.find(t => t.id === m.team1Id);
                    const t2 = teams.find(t => t.id === m.team2Id);
                    return <option key={m.id} value={m.id} className="bg-neutral-950">{t1?.nameEn} vs {t2?.nameEn}</option>;
                  })}
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <CalendarDays size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="w-full bg-neutral-800/60 border border-neutral-700/50 rounded-xl pl-8 pr-2 py-2 text-[9px] md:text-[10px] font-bold focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <span className="text-neutral-600 text-[8px]">-</span>
                  <div className="relative flex-1">
                    <CalendarDays size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="w-full bg-neutral-800/60 border border-neutral-700/50 rounded-xl pl-8 pr-2 py-2 text-[9px] md:text-[10px] font-bold focus:outline-none focus:border-primary transition-all" />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button onClick={() => { setDateFrom(''); setDateTo(''); }}
                      className="text-neutral-600 hover:text-white text-[10px] font-bold px-1 shrink-0">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="flex gap-1">
                  {[
                    { id: 'active', label: lang === 'ar' ? 'النشطة' : 'Active' },
                    { id: 'archived', label: lang === 'ar' ? 'المؤرشفة' : 'Archived' },
                    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
                  ].map(f => (
                    <button key={f.id} onClick={() => setFilterArchive(f.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-[7px] md:text-[8px] font-black uppercase transition-all ${
                        filterArchive === f.id ? 'bg-primary text-white shadow-sm' : 'bg-neutral-800/60 text-neutral-500 border border-neutral-700/50 hover:text-white'
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reservations List */}
            <div className="space-y-1.5 md:space-y-2">
              {filteredReservations.length > 0 ? filteredReservations.map(renderReservationRow) : (
                <div className="text-center py-12 text-neutral-600 text-sm font-bold">{T.noReservations}</div>
              )}
            </div>

            {/* Edit Reservation Modal */}
            <AnimatePresence>
              {editReservation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                  onClick={() => setEditReservation(null)}>
                  <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                    className="bg-neutral-900 border border-white/[0.06] rounded-2xl md:rounded-[2rem] p-5 md:p-6 w-full max-w-sm"
                    onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-black uppercase mb-4">{T.editReservation}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[8px] font-black uppercase text-neutral-500 mb-1 block">{T.seatType}</label>
                        <select className="w-full bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-primary transition-all"
                          value={editResForm.placeType} onChange={e => setEditResForm({ ...editResForm, placeType: e.target.value as SeatTier })}>
                          {(['standard', 'premium', 'vip'] as SeatTier[]).map(t => (
                            <option key={t} value={t} className="bg-neutral-950">{T[t]}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-neutral-500 mb-1 block">{T.guests}</label>
                        <input type="number" min="1" max="20"
                          className="w-full bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-primary transition-all"
                          value={editResForm.guests} onChange={e => setEditResForm({ ...editResForm, guests: Number(e.target.value) })} />
                      </div>
                      <p className="text-[8px] text-neutral-600">{T.price}: {(() => {
                        const config = venueConfigs.find(v => v.matchId === editReservation.matchId);
                        return (config?.tiers?.[editResForm.placeType as SeatTier]?.price || 50) * editResForm.guests;
                      })()} SAR</p>
                      <div className="flex gap-2 pt-1">
                        <button onClick={async () => {
                          if (!editReservation.id) return;
                          const config = venueConfigs.find(v => v.matchId === editReservation.matchId);
                          const unitPrice = config?.tiers?.[editResForm.placeType as SeatTier]?.price || 50;
                          await onUpdateReservation(editReservation.id!, {
                            placeType: editResForm.placeType,
                            guests: editResForm.guests,
                            price: unitPrice * editResForm.guests,
                          });
                          setEditReservation(null);
                        }} className="flex-1 bg-primary text-white py-2.5 rounded-xl font-black text-[9px] uppercase">
                          {T.saveChanges}
                        </button>
                        <button onClick={() => setEditReservation(null)}
                          className="px-5 py-2.5 border border-white/[0.06] rounded-xl font-black text-[9px] uppercase text-neutral-500">
                          {T.cancel}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="card-blur p-3 md:p-4 rounded-2xl md:rounded-3xl">
              <h3 className="text-xs md:text-sm font-black uppercase mb-3 flex items-center gap-2">
                <History size={14} className="text-primary" /> {lang === 'ar' ? 'سجل الأرشفة' : 'Archive History'}
                <span className="text-[9px] font-bold text-neutral-500 bg-neutral-800/60 px-2 py-0.5 rounded-full">{archivedCount}</span>
              </h3>
              <div className="space-y-1.5">
                {historyReservations.length > 0 ? historyReservations.map(renderReservationRow) : (
                  <div className="text-center py-12 text-neutral-600 text-xs font-bold">{lang === 'ar' ? 'لا توجد حجوزات مؤرشفة' : 'No archived reservations'}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <motion.div key="matches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 md:space-y-4">
            <div className="card-blur p-3 md:p-4 rounded-2xl md:rounded-3xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-xs font-black uppercase">{T.scheduleManagement}</span>
                </div>
                <button onClick={() => setShowAddMatch(!showAddMatch)}
                  className="bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-primary-dark transition-all">
                  <Plus size={11} /> {T.addSingleMatch}
                </button>
              </div>

              <AnimatePresence>
                {showAddMatch && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 bg-primary/[0.03] border border-primary/10 rounded-2xl">
                    <form onSubmit={handleAddMatch} className="space-y-2.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <select required className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary" value={newMatch.team1Id} onChange={e => setNewMatch({...newMatch, team1Id: e.target.value})}>
                          <option value="" className="bg-neutral-950">{lang === 'ar' ? 'الفريق الأول' : 'Home Team'}</option>
                          {teams.map(t => <option key={t.id} value={t.id} className="bg-neutral-950">{t.nameEn}</option>)}
                        </select>
                        <select required className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary" value={newMatch.team2Id} onChange={e => setNewMatch({...newMatch, team2Id: e.target.value})}>
                          <option value="" className="bg-neutral-950">{lang === 'ar' ? 'الفريق الثاني' : 'Away Team'}</option>
                          {teams.map(t => <option key={t.id} value={t.id} className="bg-neutral-950">{t.nameEn}</option>)}
                        </select>
                        <input required type="text" placeholder="Date (EN)" className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary" value={newMatch.dateEn} onChange={e => setNewMatch({...newMatch, dateEn: e.target.value})} />
                        <input required type="text" placeholder="Date (AR)" className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary" value={newMatch.dateAr} onChange={e => setNewMatch({...newMatch, dateAr: e.target.value})} />
                        <input required type="text" placeholder="Time (20:00)" className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary" value={newMatch.time} onChange={e => setNewMatch({...newMatch, time: e.target.value})} />
                        <input type="text" placeholder={lang === 'ar' ? 'المجموعة' : 'Group'} className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary" value={newMatch.groupEn} onChange={e => setNewMatch({...newMatch, groupEn: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-black text-[9px] uppercase">{T.saveMatch}</button>
                        <button type="button" onClick={() => setShowAddMatch(false)} className="px-4 py-2 border border-white/[0.06] rounded-xl font-black text-[9px] uppercase text-neutral-500">{T.cancelMatch}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {matches.sort((a, b) => a.timestamp - b.timestamp).map(m => {
                  const t1 = teams.find(t => t.id === m.team1Id);
                  const t2 = teams.find(t => t.id === m.team2Id);
                  const isEditing = editMatchId === m.id;
                  return (
                    <div key={m.id} className="bg-neutral-900/60 border border-neutral-800/60 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            <select className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg px-2 py-1.5 text-[8px] font-bold" value={editMatchForm.team1Id}
                              onChange={e => setEditMatchForm({...editMatchForm, team1Id: e.target.value})}>
                              {teams.map(t => <option key={t.id} value={t.id} className="bg-neutral-950">{t.nameEn}</option>)}
                            </select>
                            <select className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg px-2 py-1.5 text-[8px] font-bold" value={editMatchForm.team2Id}
                              onChange={e => setEditMatchForm({...editMatchForm, team2Id: e.target.value})}>
                              {teams.map(t => <option key={t.id} value={t.id} className="bg-neutral-950">{t.nameEn}</option>)}
                            </select>
                            <input className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg px-2 py-1.5 text-[8px] font-bold" value={editMatchForm.dateEn}
                              onChange={e => setEditMatchForm({...editMatchForm, dateEn: e.target.value})} />
                            <input className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg px-2 py-1.5 text-[8px] font-bold" value={editMatchForm.dateAr}
                              onChange={e => setEditMatchForm({...editMatchForm, dateAr: e.target.value})} />
                            <input className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg px-2 py-1.5 text-[8px] font-bold" value={editMatchForm.time}
                              onChange={e => setEditMatchForm({...editMatchForm, time: e.target.value})} />
                            <input className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg px-2 py-1.5 text-[8px] font-bold" value={editMatchForm.groupEn}
                              onChange={e => setEditMatchForm({...editMatchForm, groupEn: e.target.value})} />
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={async () => { await updateDocument('matches', m.id, editMatchForm); setEditMatchId(null); }}
                              className="flex-1 bg-primary text-white py-1.5 rounded-lg text-[8px] font-black uppercase">{T.saveChanges}</button>
                            <button onClick={() => setEditMatchId(null)} className="px-3 py-1.5 border border-white/[0.06] rounded-lg text-[8px] font-black uppercase text-neutral-500">{T.cancel}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-center p-1 z-10">
                                  <img src={t1?.logoUrl} className="w-full h-full object-contain" />
                                </div>
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-center p-1">
                                  <img src={t2?.logoUrl} className="w-full h-full object-contain" />
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] md:text-xs font-black uppercase">{t1?.nameEn} vs {t2?.nameEn}</div>
                                <div className="text-[7px] md:text-[8px] font-bold text-neutral-500">{m.dateEn} • {m.time} AST • {lang === 'ar' ? m.groupAr : m.groupEn}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => { setEditMatchId(m.id); setEditMatchForm({ team1Id: m.team1Id, team2Id: m.team2Id, dateEn: m.dateEn, dateAr: m.dateAr, time: m.time, groupEn: m.groupEn, groupAr: m.groupAr }); }}
                                className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:text-primary transition-all">
                                <PenSquare size={9} className="md:size-[11px]" />
                              </button>
                              <button onClick={() => onToggleMatch(m.id, !m.isActive)}
                                className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center transition-all ${m.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {m.isActive ? <CheckCircle size={10} className="md:size-3" /> : <XCircle size={10} className="md:size-3" />}
                              </button>
                              <button onClick={() => { if(confirm('Delete?')) deleteDocument('matches', m.id); }}
                                className="w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-neutral-700 hover:text-red-500 transition-colors">
                                <Trash2 size={9} className="md:size-[11px]" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {[{ key: 'isSaudiMatch', label: 'Saudi' }, { key: 'isArabMatch', label: 'Arab' }, { key: 'isFeatured', label: 'Featured' }].map(tag => (
                              <button key={tag.key}
                                onClick={() => updateDocument('matches', m.id, { [tag.key]: !((m as any)[tag.key]) })}
                                className={`px-1.5 py-0.5 rounded-lg text-[6px] md:text-[7px] font-black uppercase border transition-all ${
                                  (m as any)[tag.key] ? 'bg-white/[0.08] border-white/[0.12] text-white' : 'bg-transparent border-white/[0.04] text-neutral-600'
                                }`}>
                                {tag.label}
                              </button>
                            ))}
                            {(m.tags || []).map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 rounded-lg text-[6px] md:text-[7px] font-black uppercase bg-primary/10 border border-primary/20 text-primary">{tag}</span>
                            ))}
                            <button onClick={() => {
                              const newTag = prompt(lang === 'ar' ? 'أضف وسم:' : 'Add tag:');
                              if (newTag?.trim()) { updateDocument('matches', m.id, { tags: [...(m.tags || []), newTag.trim()] }); }
                            }} className="px-1.5 py-0.5 rounded-lg text-[6px] font-black uppercase border border-dashed border-white/[0.12] text-neutral-500 hover:text-primary transition-all">
                              <Tag size={8} className="inline" />
                            </button>
                          </div>

                          {/* Venue Configs */}
                          <div className="border-t border-white/[0.04] pt-2 space-y-1.5">
                            {(() => {
                              const matchConfigs = venueConfigs.filter(v => v.matchId === m.id);
                              return matchConfigs.length > 0 ? matchConfigs.map(config => {
                                const mall = malls.find(ml => ml.id === config.mallId);
                                return (
                                  <div key={config.id}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[7px] font-black uppercase text-neutral-500">{mall?.nameEn || config.mallId}</span>
                                      <button onClick={() => startEditConfig(config)} className="text-primary text-[6px] font-black uppercase">Edit</button>
                                    </div>
                                    {editingConfig === config.id && editTiers ? (
                                      <div className="space-y-1 mt-1">
                                        {(Object.entries(editTiers) as [SeatTier, any][]).map(([tier, cfg]) => (
                                          <div key={tier} className="grid grid-cols-3 gap-1 text-[8px]">
                                            <span className="font-bold uppercase text-neutral-500">{tier}</span>
                                            <input type="number" className="bg-neutral-800/60 border border-neutral-700/50 rounded px-1.5 py-0.5 text-[8px] w-full"
                                              value={cfg.price} onChange={e => {
                                                const newTiers = { ...editTiers, [tier]: { ...cfg, price: Number(e.target.value) } };
                                                setEditTiers(newTiers);
                                              }} />
                                            <input type="number" className="bg-neutral-800/60 border border-neutral-700/50 rounded px-1.5 py-0.5 text-[8px] w-full"
                                              value={cfg.totalSeats} onChange={e => {
                                                const newTiers = { ...editTiers, [tier]: { ...cfg, totalSeats: Number(e.target.value) } };
                                                setEditTiers(newTiers);
                                              }} />
                                          </div>
                                        ))}
                                        <div className="flex gap-1">
                                          <button onClick={saveConfig} className="flex-1 bg-primary text-white py-1 rounded-lg text-[7px] font-black uppercase"><Save size={8} className="inline" /> Save</button>
                                          <button onClick={() => setEditingConfig(null)} className="px-2 py-1 border border-white/[0.06] rounded-lg text-[7px] font-black uppercase text-neutral-500"><X size={8} /></button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-1.5 text-[7px] font-bold flex-wrap mt-0.5">
                                        {(Object.entries(config.tiers) as [SeatTier, any][]).map(([tier, cfg]) => (
                                          <span key={tier} className="text-neutral-500 uppercase">
                                            {tier}: <span className="text-white">{cfg.bookedSeats}/{cfg.totalSeats}</span>
                                            <span className="text-neutral-600"> · {cfg.price} SAR</span>
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }) : (
                                <div className="text-[7px] font-bold text-neutral-600">No venue configs</div>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* VENUES TAB */}
        {activeTab === 'venues' && (
          <motion.div key="venues" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 md:space-y-4">
            <div className="card-blur p-3 md:p-4 rounded-2xl md:rounded-3xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs md:text-sm font-black uppercase flex items-center gap-2">
                  <Building2 size={14} className="text-primary" /> {T.manageVenues}
                </h3>
                <button onClick={() => setShowAddVenue(!showAddVenue)}
                  className="bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-primary-dark transition-all">
                  <Plus size={11} /> {lang === 'ar' ? 'إضافة مكان' : 'Add Venue'}
                </button>
              </div>

              <AnimatePresence>
                {showAddVenue && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-4 bg-primary/[0.03] border border-primary/10 rounded-2xl">
                    <form onSubmit={handleAddVenue} className="space-y-2.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <input required type="text" placeholder={lang === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}
                          className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary"
                          value={newVenue.nameAr} onChange={e => setNewVenue({...newVenue, nameAr: e.target.value})} />
                        <input required type="text" placeholder={lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}
                          className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary"
                          value={newVenue.nameEn} onChange={e => setNewVenue({...newVenue, nameEn: e.target.value})} />
                        <input type="text" placeholder={lang === 'ar' ? 'المدينة (عربي)' : 'City (AR)'}
                          className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary"
                          value={newVenue.cityAr} onChange={e => setNewVenue({...newVenue, cityAr: e.target.value})} />
                        <input type="text" placeholder={lang === 'ar' ? 'المدينة (إنجليزي)' : 'City (EN)'}
                          className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-primary"
                          value={newVenue.cityEn} onChange={e => setNewVenue({...newVenue, cityEn: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-xl font-black text-[9px] uppercase">{lang === 'ar' ? 'حفظ' : 'Save'}</button>
                        <button type="button" onClick={() => setShowAddVenue(false)} className="px-4 py-2 border border-white/[0.06] rounded-xl font-black text-[9px] uppercase text-neutral-500">{T.cancel}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {malls.map(mall => (
                  <div key={mall.id} className="bg-neutral-900/60 border border-neutral-800/60 rounded-xl md:rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 size={16} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black">{lang === 'ar' ? mall.nameAr : mall.nameEn}</h4>
                        <p className="text-[8px] font-bold text-neutral-500">{lang === 'ar' ? mall.cityAr : mall.cityEn}</p>
                      </div>
                    </div>
                    <div className="text-[8px] font-bold text-neutral-600">
                      {matches.filter(mx => mx.mallId === mall.id).length} {lang === 'ar' ? 'مباراة' : 'matches'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && (
          <motion.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card-blur p-4 md:p-6 rounded-2xl md:rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase">{T.bulkImport}</h3>
                  <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">JSON</p>
                </div>
              </div>
              <textarea className="w-full h-36 bg-neutral-900/60 border border-neutral-800/60 rounded-xl p-3 text-[9px] font-mono text-neutral-400 focus:outline-none focus:border-blue-500 resize-none mb-3"
                placeholder='[{ "team1Id":"t1","team2Id":"t2","dateEn":"June 11","time":"20:00" }]'
                value={bulkJson} onChange={e => setBulkJson(e.target.value)} />
              <button onClick={handleBulkImport} disabled={!bulkJson}
                className="w-full bg-blue-500 text-white py-2.5 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2 disabled:opacity-30">
                <Filter size={12} /> {T.processImport}
              </button>
              <div className="mt-4">
                <h4 className="text-[9px] font-black uppercase text-neutral-500 mb-2">{lang === 'ar' ? 'رفع CSV' : 'CSV Import'}</h4>
                <div className="border-2 border-dashed border-neutral-800/60 rounded-xl p-4 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet size={20} className="mx-auto mb-1.5 text-neutral-600" />
                  <p className="text-[9px] font-bold text-neutral-500">{csvFile ? csvFile.name : (lang === 'ar' ? 'اضغط لرفع ملف' : 'Click to upload')}</p>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                </div>
                {csvFile && (
                  <button onClick={handleCsvImport} className="w-full mt-2 bg-green-600 text-white py-2 rounded-xl font-black text-[9px] uppercase">
                    {lang === 'ar' ? 'استيراد' : 'Import'} {csvFile.name}
                  </button>
                )}
              </div>
            </div>

            <div className="card-blur p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <Database size={22} className="text-white" />
              </div>
              <h3 className="text-base font-black uppercase tracking-tighter mb-2">{T.system}</h3>
              <p className="text-neutral-500 text-[9px] font-bold max-w-xs mb-4 uppercase tracking-[0.15em] leading-relaxed">
                {lang === 'ar' ? 'سيتم إعادة تعيين البيانات الأساسية' : 'Reset and seed core data'}
              </p>
              <div className="flex flex-col gap-2 self-stretch">
                <button onClick={seedData} className="w-full bg-primary text-white py-2.5 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2">
                  <ShieldCheck size={12} /> {T.reSeed}
                </button>
                {navigator.onLine && (
                  <button onClick={async () => {
                    const n = await syncLocalReservations();
                    alert(n > 0 ? `Synced ${n} ${lang === 'ar' ? 'حجز' : 'reservations'}!` : (lang === 'ar' ? 'لا توجد حجوزات محلية' : 'No local reservations'));
                  }} className="w-full bg-green-600 text-white py-2.5 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2">
                    <Upload size={12} /> {lang === 'ar' ? 'مزامنة محلية' : 'Sync Local'}
                  </button>
                )}
              </div>
            </div>

            <div className="card-blur p-4 md:p-6 rounded-2xl md:rounded-3xl space-y-3 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase">Firestore Diagnostics</h3>
                  <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">{lang === 'ar' ? 'اختبار الاتصال بقاعدة البيانات' : 'Test database connection'}</p>
                </div>
              </div>
              <button onClick={async () => { setDiagLoading(true); setDiagResult(null); const r = await testFirestoreConnection(); setDiagResult(r); setDiagLoading(false); }}
                disabled={diagLoading} className="w-full bg-yellow-600 text-white py-2.5 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-2 disabled:opacity-30">
                {diagLoading ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Testing...</> : <><ShieldCheck size={12} /> Test Connection</>}
              </button>
              {diagResult && (
                <div className={`p-3 rounded-xl text-[9px] font-bold text-left ${
                  diagResult.ok ? 'bg-green-500/10 border border-green-500/20 text-green-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                }`}>
                  <div className="mb-0.5 font-black text-[8px] uppercase">{diagResult.ok ? '✓ Connected' : '✗ Failed'}</div>
                  <div className="font-mono text-[8px] break-all">{diagResult.message}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
