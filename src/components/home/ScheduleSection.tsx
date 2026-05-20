import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchCard } from './MatchCard';
import { SectionTitle } from '../layout/SectionTitle';
import { Search, Calendar, X, Filter, ArrowUpDown } from 'lucide-react';
import { Language, Translation, Match, Team, Tournament, Mall, MatchVenueConfig } from '../../types';

interface ScheduleSectionProps {
  T: Translation;
  lang: Language;
  matches: Match[];
  malls: Mall[];
  tournaments: Tournament[];
  teams: Team[];
  venueConfigs: MatchVenueConfig[];
  onBook: (matchId: string) => void;
}

export const ScheduleSection = ({ T, lang, matches, malls, tournaments, teams, venueConfigs, onBook }: ScheduleSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'saudi' | 'arab'>('all');
  const [sortAsc, setSortAsc] = useState(true);

  const filteredMatches = useMemo(() => {
    let filtered = matches.filter(m => m.isActive !== false);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        const t1 = teams.find(t => t.id === m.team1Id);
        const t2 = teams.find(t => t.id === m.team2Id);
        return (
          t1?.nameEn.toLowerCase().includes(q) ||
          t1?.nameAr.includes(searchQuery) ||
          t2?.nameEn.toLowerCase().includes(q) ||
          t2?.nameAr.includes(searchQuery) ||
          t1?.flagCode.toLowerCase().includes(q) ||
          t2?.flagCode.toLowerCase().includes(q)
        );
      });
    }

    if (selectedDate) {
      filtered = filtered.filter(m => m.dateEn === selectedDate);
    }

    if (filterType === 'saudi') {
      filtered = filtered.filter(m => m.isSaudiMatch);
    } else if (filterType === 'arab') {
      filtered = filtered.filter(m => m.isArabMatch);
    }

    filtered.sort((a, b) => {
      const diff = a.timestamp - b.timestamp;
      return sortAsc ? diff : -diff;
    });

    return filtered;
  }, [matches, searchQuery, selectedDate, filterType, sortAsc, teams]);

  const uniqueDates = useMemo(() =>
    Array.from(new Set(matches.map(m => m.dateEn))).sort((a, b) => {
      const ma = matches.find(m => m.dateEn === a);
      const mb = matches.find(m => m.dateEn === b);
      return (ma?.timestamp || 0) - (mb?.timestamp || 0);
    }),
    [matches]
  );

  return (
    <section id="schedule-section" className="px-4 md:px-6 py-16 md:py-20 max-w-7xl mx-auto">
      <SectionTitle title={T.upcoming} subtitle={lang === 'ar' ? 'برنامج المباريات' : 'MATCH PROGRAM'} align="left" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
          {[
            { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
            { id: 'saudi', label: lang === 'ar' ? 'السعودية' : 'Saudi' },
            { id: 'arab', label: lang === 'ar' ? 'العرب' : 'Arab' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                filterType === f.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/[0.04] text-neutral-500 border border-white/[0.06] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
            <input
              type="text"
              placeholder={T.searchTeam}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-8 text-xs font-bold focus:outline-none focus:border-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="relative sm:w-40">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
            <select
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-8 text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:border-primary transition-all"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="" className="bg-neutral-950">{T.allDates}</option>
              {uniqueDates.map(date => (
                <option key={date} value={date} className="bg-neutral-950">{date}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:border-primary transition-all"
            title={T.sortByNearest}
          >
            <ArrowUpDown size={14} className={`text-neutral-500 transition-all ${sortAsc ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        <AnimatePresence mode="popLayout">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((m) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <MatchCard
                match={m}
                mall={malls.find(ml => ml.id === m.mallId)}
                tournaments={tournaments}
                teams={teams}
                lang={lang}
                T={T}
                malls={malls}
                venueConfigs={venueConfigs}
                config={venueConfigs.find(v => v.matchId === m.id)}
                onClick={() => onBook(m.id)}
              />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-16 text-center flex flex-col items-center"
            >
              <Filter size={36} className="text-neutral-700 mb-4" />
              <p className="text-neutral-500 font-bold text-sm">{T.noMatches}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
