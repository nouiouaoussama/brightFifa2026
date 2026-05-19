import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Users, MapPin, Database, CheckCircle,
  XCircle, Phone, CreditCard, Calendar, Clock, Plus,
  Globe, Trophy, ShieldCheck, Upload, Trash2, Filter,
  DollarSign, UserCheck, Ticket, Edit3, Save, X,
  Download, FileSpreadsheet
} from 'lucide-react';
import { Translation, Language, Match, Team, Tournament, Mall, Reservation, MatchVenueConfig, SeatTier } from '../../types';
import { updateDocument, addDocument, deleteDocument, setDocument, seedInitialData, bulkImportMatches, importFromCsv } from '../../services/firebase';
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
  const [activeTab, setActiveTab] = useState<'reservations' | 'matches' | 'venues' | 'data'>('reservations');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMatchId, setFilterMatchId] = useState('all');
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editTiers, setEditTiers] = useState<any>(null);
  const [bulkJson, setBulkJson] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMatch, setNewMatch] = useState({
    team1Id: '', team2Id: '', dateEn: '', dateAr: '',
    time: '', groupEn: '', groupAr: '', isFeatured: false
  });

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) || r.serial?.includes(searchQuery);
    const matchesFilter = filterMatchId === 'all' || r.matchId === filterMatchId;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = reservations.reduce((a, r) => a + (r.paymentStatus === 'paid' ? r.price : 0), 0);
  const pendingRevenue = reservations.reduce((a, r) => a + (r.paymentStatus === 'unpaid' ? r.price : 0), 0);
  const totalGuests = reservations.reduce((a, r) => a + r.guests, 0);
  const checkins = reservations.filter(r => r.attendanceStatus === 'attended').length;

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

  return (
    <div className="space-y-6 pb-32">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: T.totalRevenue, value: `${totalRevenue.toLocaleString()} SAR`, color: 'text-green-500', icon: DollarSign },
          { label: T.pendingPayments, value: `${pendingRevenue.toLocaleString()} SAR`, color: 'text-yellow-500', icon: Clock },
          { label: T.totalGuests, value: totalGuests, color: 'text-white', icon: Users },
          { label: T.checkins, value: checkins, color: 'text-primary', icon: UserCheck }
        ].map((stat, i) => (
          <div key={i} className="card-blur p-4 md:p-5 rounded-2xl md:rounded-3xl">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={12} className="text-neutral-600" />
              <div className="text-[8px] md:text-[10px] font-black uppercase text-neutral-500">{stat.label}</div>
            </div>
            <div className={`text-lg md:text-2xl font-black tracking-tighter ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'reservations', icon: Ticket, label: T.bookings },
          { id: 'matches', icon: Trophy, label: T.matches },
          { id: 'venues', icon: MapPin, label: T.manageVenues },
          { id: 'data', icon: Database, label: T.system }
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'bg-white/[0.04] text-neutral-500 hover:text-white border border-white/[0.06]'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'reservations' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
                <input placeholder={lang === 'ar' ? 'بحث...' : 'Search...'} className="input-field pl-10 py-2.5 text-xs"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <select className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-2.5 text-xs font-bold w-full md:w-auto"
                value={filterMatchId} onChange={e => setFilterMatchId(e.target.value)}>
                <option value="all">{lang === 'ar' ? 'كل المباريات' : 'All Matches'}</option>
                {matches.map(m => {
                  const t1 = teams.find(t => t.id === m.team1Id);
                  const t2 = teams.find(t => t.id === m.team2Id);
                  return <option key={m.id} value={m.id}>{t1?.nameEn} vs {t2?.nameEn}</option>;
                })}
              </select>
            </div>

            <div className="space-y-2">
              {filteredReservations.map(res => {
                const m = matches.find(mx => mx.id === res.matchId);
                const t1 = teams.find(t => t.id === m?.team1Id);
                const t2 = teams.find(t => t.id === m?.team2Id);
                return (
                  <div key={res.id} className="card-blur p-4 rounded-2xl border border-white/[0.04] hover:border-primary/20 transition-all">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border ${
                          res.attendanceStatus === 'attended' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-white/[0.04] border-white/[0.06] text-neutral-500'
                        }`}>
                          <span className="text-sm font-black">{res.guests}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-black text-xs uppercase truncate">{res.name}</h4>
                            <span className="text-[7px] font-bold text-neutral-600 bg-white/[0.04] px-1.5 py-0.5 rounded-full">#{res.serial}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[8px] font-bold text-neutral-500">
                            <span className="flex items-center gap-1"><Phone size={8} /> {res.phone}</span>
                            <span>{t1?.nameEn} vs {t2?.nameEn}</span>
                            <span className="text-white/70">{res.price} SAR</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onUpdateReservation(res.id!, { paymentStatus: res.paymentStatus === 'paid' ? 'unpaid' : 'paid' })}
                          className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-1.5 transition-all ${
                            res.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-white/[0.04] text-neutral-500 border border-white/[0.06]'
                          }`}>
                          <DollarSign size={10} /> {res.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </button>
                        <button onClick={() => onUpdateReservation(res.id!, { attendanceStatus: res.attendanceStatus === 'attended' ? 'not_attended' : 'attended' })}
                          className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase flex items-center gap-1.5 transition-all ${
                            res.attendanceStatus === 'attended' ? 'bg-primary text-white' : 'bg-white/[0.04] text-neutral-500 border border-white/[0.06]'
                          }`}>
                          <UserCheck size={10} /> {res.attendanceStatus === 'attended' ? 'Done' : 'Check'}
                        </button>
                        <a href={`https://wa.me/${res.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                          className="p-2 bg-white/[0.04] rounded-xl border border-white/[0.06] hover:bg-[#25D366] hover:text-white transition-all">
                          <Phone size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredReservations.length === 0 && (
                <div className="text-center py-12 text-neutral-600 text-sm font-bold">{T.noReservations}</div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'matches' && (
          <motion.div key="mgmt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center justify-between card-blur p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-primary" />
                <span className="text-xs font-black uppercase">{T.scheduleManagement}</span>
              </div>
              <button onClick={() => setShowAddMatch(!showAddMatch)}
                className="bg-primary text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-primary-dark transition-all">
                <Plus size={12} /> {T.addSingleMatch}
              </button>
            </div>

            {showAddMatch && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="card-blur p-5 rounded-3xl border border-primary/10 bg-primary/[0.02]">
                <form onSubmit={handleAddMatch} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select required className="input-field py-2.5 text-xs" value={newMatch.team1Id} onChange={e => setNewMatch({...newMatch, team1Id: e.target.value})}>
                      <option value="">{lang === 'ar' ? 'الفريق الأول' : 'Home Team'}</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.nameEn}</option>)}
                    </select>
                    <select required className="input-field py-2.5 text-xs" value={newMatch.team2Id} onChange={e => setNewMatch({...newMatch, team2Id: e.target.value})}>
                      <option value="">{lang === 'ar' ? 'الفريق الثاني' : 'Away Team'}</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.nameEn}</option>)}
                    </select>
                    <input required type="text" placeholder={lang === 'ar' ? 'التاريخ (إنجليزي)' : 'Date (EN)'} className="input-field py-2.5 text-xs" value={newMatch.dateEn}
                      onChange={e => setNewMatch({...newMatch, dateEn: e.target.value})} />
                    <input required type="text" placeholder={lang === 'ar' ? 'التاريخ (عربي)' : 'Date (AR)'} className="input-field py-2.5 text-xs" value={newMatch.dateAr}
                      onChange={e => setNewMatch({...newMatch, dateAr: e.target.value})} />
                    <input required type="text" placeholder="Time (20:00)" className="input-field py-2.5 text-xs" value={newMatch.time}
                      onChange={e => setNewMatch({...newMatch, time: e.target.value})} />
                    <input type="text" placeholder={lang === 'ar' ? 'المجموعة' : 'Group'} className="input-field py-2.5 text-xs" value={newMatch.groupEn}
                      onChange={e => setNewMatch({...newMatch, groupEn: e.target.value})} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase">{T.saveMatch}</button>
                    <button type="button" onClick={() => setShowAddMatch(false)} className="px-6 py-3 border border-white/[0.06] rounded-xl font-black text-[10px] uppercase text-neutral-500">{T.cancelMatch}</button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {matches.sort((a, b) => a.timestamp - b.timestamp).map(m => {
                const t1 = teams.find(t => t.id === m.team1Id);
                const t2 = teams.find(t => t.id === m.team2Id);
                const config = venueConfigs.find(v => v.matchId === m.id);
                return (
                  <div key={m.id} className="card-blur p-4 rounded-2xl border border-white/[0.04] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-center p-1.5 z-10">
                            <img src={t1?.logoUrl} className="w-full h-full object-contain" />
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-center p-1.5">
                            <img src={t2?.logoUrl} className="w-full h-full object-contain" />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase">{t1?.nameEn} vs {t2?.nameEn}</div>
                          <div className="text-[8px] font-bold text-neutral-500">{m.dateEn} • {m.time} AST</div>
                        </div>
                      </div>
                      <button onClick={() => onToggleMatch(m.id, !m.isActive)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          m.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {m.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: 'isSaudiMatch', label: 'Saudi' },
                        { key: 'isArabMatch', label: 'Arab' },
                        { key: 'isFeatured', label: 'Featured' }
                      ].map(tag => (
                        <button key={tag.key}
                          onClick={() => updateDocument('matches', m.id, { [tag.key]: !((m as any)[tag.key]) })}
                          className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase border transition-all ${
                            (m as any)[tag.key] ? 'bg-white/[0.08] border-white/[0.12] text-white' : 'bg-transparent border-white/[0.04] text-neutral-600'
                          }`}>
                          {tag.label}
                        </button>
                      ))}
                      <button onClick={() => { if(confirm('Delete?')) deleteDocument('matches', m.id); }}
                        className="ml-auto p-1.5 text-neutral-700 hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    {config && (
                      <div className="border-t border-white/[0.04] pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] font-black uppercase text-neutral-500">{T.manageVenues}</span>
                          <button onClick={() => startEditConfig(config)} className="text-primary text-[8px] font-black uppercase flex items-center gap-1">
                            <Edit3 size={10} /> {T.editSeats}
                          </button>
                        </div>
                        {editingConfig === config.id && editTiers ? (
                          <div className="space-y-2">
                            {(Object.entries(editTiers) as [SeatTier, any][]).map(([tier, cfg]) => (
                              <div key={tier} className="grid grid-cols-3 gap-2 text-[10px]">
                                <span className="font-bold uppercase text-neutral-500">{tier}</span>
                                <input type="number" className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-xs w-full"
                                  value={cfg.price} onChange={e => {
                                    const newTiers = { ...editTiers, [tier]: { ...cfg, price: Number(e.target.value) } };
                                    setEditTiers(newTiers);
                                  }} />
                                <input type="number" className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-xs w-full"
                                  value={cfg.totalSeats} onChange={e => {
                                    const newTiers = { ...editTiers, [tier]: { ...cfg, totalSeats: Number(e.target.value) } };
                                    setEditTiers(newTiers);
                                  }} />
                              </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                              <button onClick={saveConfig} className="flex-1 bg-primary text-white py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-1">
                                <Save size={10} /> {T.saveSeats}
                              </button>
                              <button onClick={() => setEditingConfig(null)} className="px-3 py-1.5 border border-white/[0.06] rounded-lg text-[9px] font-black uppercase text-neutral-500">
                                <X size={10} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3 text-[9px] font-bold">
                            {(Object.entries(config.tiers) as [SeatTier, any][]).map(([tier, cfg]) => (
                              <span key={tier} className="text-neutral-500 uppercase">
                                {tier}: <span className="text-white">{cfg.bookedSeats}/{cfg.totalSeats}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'venues' && (
          <motion.div key="venues" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {malls.map(mall => (
              <div key={mall.id} className="card-blur p-6 rounded-[2rem] border border-white/[0.04]">
                <div className="flex items-center gap-4 mb-4">
                  <MapPin size={24} className="text-primary" />
                  <div>
                    <h3 className="text-lg font-black tracking-tighter">{lang === 'ar' ? mall.nameAr : mall.nameEn}</h3>
                    <p className="text-[10px] font-bold text-neutral-500">{lang === 'ar' ? mall.cityAr : mall.cityEn}</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-neutral-600">
                  {matches.filter(m => m.mallId === mall.id).length} {lang === 'ar' ? 'مباراة مستضافة' : 'matches hosted'}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-blur p-6 rounded-[2rem] border border-white/[0.04]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <Upload size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase">{T.bulkImport}</h3>
                  <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">JSON</p>
                </div>
              </div>
              <textarea className="w-full h-48 bg-black/40 border border-white/[0.06] rounded-2xl p-4 text-[10px] font-mono text-neutral-400 focus:outline-none focus:border-blue-500 resize-none mb-4"
                placeholder='[{ "team1Id":"t1","team2Id":"t2","dateEn":"June 11","time":"20:00" }]'
                value={bulkJson} onChange={e => setBulkJson(e.target.value)} />
              <button onClick={handleBulkImport} disabled={!bulkJson}
                className="w-full bg-blue-500 text-white py-3 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-3 disabled:opacity-30">
                <Filter size={14} /> {T.processImport}
              </button>

              <div className="mt-6">
                <h4 className="text-[10px] font-black uppercase text-neutral-500 mb-3">{lang === 'ar' ? 'رفع CSV' : 'CSV Import'}</h4>
                <div className="border-2 border-dashed border-white/[0.06] rounded-2xl p-6 text-center"
                  onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet size={24} className="mx-auto mb-2 text-neutral-600" />
                  <p className="text-[10px] font-bold text-neutral-500">{csvFile ? csvFile.name : (lang === 'ar' ? 'اضغط لرفع ملف' : 'Click to upload file')}</p>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                    onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                </div>
                {csvFile && (
                  <button onClick={handleCsvImport}
                    className="w-full mt-3 bg-green-600 text-white py-3 rounded-2xl font-black text-[10px] uppercase">
                    {lang === 'ar' ? 'استيراد' : 'Import'} {csvFile.name}
                  </button>
                )}
              </div>
            </div>

            <div className="card-blur p-6 rounded-[2rem] border border-white/[0.04] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                <Database size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-3">{T.system}</h3>
              <p className="text-neutral-500 text-[10px] font-bold max-w-xs mb-6 uppercase tracking-[0.15em] leading-relaxed">
                {lang === 'ar' ? 'سيتم إعادة تعيين البيانات الأساسية' : 'Reset and seed core database data'}
              </p>
              <button onClick={seedData} className="btn-primary flex items-center gap-3 text-xs">
                <ShieldCheck size={16} /> {T.reSeed}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
