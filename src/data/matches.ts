export interface Team {
  id: string;
  nameAr: string;
  nameEn: string;
  flagCode: string;
  logoUrl: string;
  confederation?: string;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  tournamentId: string;
  mallId: string;
  time: string;
  dateAr: string;
  dateEn: string;
  groupAr: string;
  groupEn: string;
  timestamp: number;
  isArabMatch?: boolean;
  isSaudiMatch?: boolean;
  isFeatured?: boolean;
  status: 'upcoming' | 'live' | 'ended';
  isActive: boolean;
  imageUrl?: string;
}

const getFlag = (code: string) => `https://flagcdn.com/w320/${code.toLowerCase()}.png`;

export const ALL_TEAMS: Team[] = [
  { id: 'ksa', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flagCode: 'SA', logoUrl: getFlag('SA'), confederation: 'AFC' },
  { id: 'jpn', nameAr: 'اليابان', nameEn: 'Japan', flagCode: 'JP', logoUrl: getFlag('JP'), confederation: 'AFC' },
  { id: 'irn', nameAr: 'إيران', nameEn: 'Iran', flagCode: 'IR', logoUrl: getFlag('IR'), confederation: 'AFC' },
  { id: 'kor', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', flagCode: 'KR', logoUrl: getFlag('KR'), confederation: 'AFC' },
  { id: 'aus', nameAr: 'أستراليا', nameEn: 'Australia', flagCode: 'AU', logoUrl: getFlag('AU'), confederation: 'AFC' },
  { id: 'qat', nameAr: 'قطر', nameEn: 'Qatar', flagCode: 'QA', logoUrl: getFlag('QA'), confederation: 'AFC' },
  { id: 'uzb', nameAr: 'أوزبكستان', nameEn: 'Uzbekistan', flagCode: 'UZ', logoUrl: getFlag('UZ'), confederation: 'AFC' },
  { id: 'jor', nameAr: 'الأردن', nameEn: 'Jordan', flagCode: 'JO', logoUrl: getFlag('JO'), confederation: 'AFC' },
  { id: 'irq', nameAr: 'العراق', nameEn: 'Iraq', flagCode: 'IQ', logoUrl: getFlag('IQ'), confederation: 'AFC' },
  { id: 'arg', nameAr: 'الأرجنتين', nameEn: 'Argentina', flagCode: 'AR', logoUrl: getFlag('AR'), confederation: 'CONMEBOL' },
  { id: 'bra', nameAr: 'البرازيل', nameEn: 'Brazil', flagCode: 'BR', logoUrl: getFlag('BR'), confederation: 'CONMEBOL' },
  { id: 'uru', nameAr: 'الأوروغواي', nameEn: 'Uruguay', flagCode: 'UY', logoUrl: getFlag('UY'), confederation: 'CONMEBOL' },
  { id: 'col', nameAr: 'كولومبيا', nameEn: 'Colombia', flagCode: 'CO', logoUrl: getFlag('CO'), confederation: 'CONMEBOL' },
  { id: 'ecu', nameAr: 'الإكوادور', nameEn: 'Ecuador', flagCode: 'EC', logoUrl: getFlag('EC'), confederation: 'CONMEBOL' },
  { id: 'par', nameAr: 'الباراغواي', nameEn: 'Paraguay', flagCode: 'PY', logoUrl: getFlag('PY'), confederation: 'CONMEBOL' },
  { id: 'mar', nameAr: 'المغرب', nameEn: 'Morocco', flagCode: 'MA', logoUrl: getFlag('MA'), confederation: 'CAF' },
  { id: 'sen', nameAr: 'السنغال', nameEn: 'Senegal', flagCode: 'SN', logoUrl: getFlag('SN'), confederation: 'CAF' },
  { id: 'egy', nameAr: 'مصر', nameEn: 'Egypt', flagCode: 'EG', logoUrl: getFlag('EG'), confederation: 'CAF' },
  { id: 'alg', nameAr: 'الجزائر', nameEn: 'Algeria', flagCode: 'DZ', logoUrl: getFlag('DZ'), confederation: 'CAF' },
  { id: 'tun', nameAr: 'تونس', nameEn: 'Tunisia', flagCode: 'TN', logoUrl: getFlag('TN'), confederation: 'CAF' },
  { id: 'rsa', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', flagCode: 'ZA', logoUrl: getFlag('ZA'), confederation: 'CAF' },
  { id: 'civ', nameAr: 'ساحل العاج', nameEn: "Côte d'Ivoire", flagCode: 'CI', logoUrl: getFlag('CI'), confederation: 'CAF' },
  { id: 'gha', nameAr: 'غانا', nameEn: 'Ghana', flagCode: 'GH', logoUrl: getFlag('GH'), confederation: 'CAF' },
  { id: 'cpv', nameAr: 'الرأس الأخضر', nameEn: 'Cape Verde', flagCode: 'CV', logoUrl: getFlag('CV'), confederation: 'CAF' },
  { id: 'cod', nameAr: 'الكونغو الديموقراطية', nameEn: 'DR Congo', flagCode: 'CD', logoUrl: getFlag('CD'), confederation: 'CAF' },
  { id: 'eng', nameAr: 'إنجلترا', nameEn: 'England', flagCode: 'GB-ENG', logoUrl: getFlag('GB'), confederation: 'UEFA' },
  { id: 'fra', nameAr: 'فرنسا', nameEn: 'France', flagCode: 'FR', logoUrl: getFlag('FR'), confederation: 'UEFA' },
  { id: 'esp', nameAr: 'إسبانيا', nameEn: 'Spain', flagCode: 'ES', logoUrl: getFlag('ES'), confederation: 'UEFA' },
  { id: 'ger', nameAr: 'ألمانيا', nameEn: 'Germany', flagCode: 'DE', logoUrl: getFlag('DE'), confederation: 'UEFA' },
  { id: 'por', nameAr: 'البرتغال', nameEn: 'Portugal', flagCode: 'PT', logoUrl: getFlag('PT'), confederation: 'UEFA' },
  { id: 'ned', nameAr: 'هولندا', nameEn: 'Netherlands', flagCode: 'NL', logoUrl: getFlag('NL'), confederation: 'UEFA' },
  { id: 'bel', nameAr: 'بلجيكا', nameEn: 'Belgium', flagCode: 'BE', logoUrl: getFlag('BE'), confederation: 'UEFA' },
  { id: 'cro', nameAr: 'كرواتيا', nameEn: 'Croatia', flagCode: 'HR', logoUrl: getFlag('HR'), confederation: 'UEFA' },
  { id: 'sui', nameAr: 'سويسرا', nameEn: 'Switzerland', flagCode: 'CH', logoUrl: getFlag('CH'), confederation: 'UEFA' },
  { id: 'aut', nameAr: 'النمسا', nameEn: 'Austria', flagCode: 'AT', logoUrl: getFlag('AT'), confederation: 'UEFA' },
  { id: 'sco', nameAr: 'اسكتلندا', nameEn: 'Scotland', flagCode: 'GB-SCT', logoUrl: getFlag('GB'), confederation: 'UEFA' },
  { id: 'nor', nameAr: 'النرويج', nameEn: 'Norway', flagCode: 'NO', logoUrl: getFlag('NO'), confederation: 'UEFA' },
  { id: 'swe', nameAr: 'السويد', nameEn: 'Sweden', flagCode: 'SE', logoUrl: getFlag('SE'), confederation: 'UEFA' },
  { id: 'tur', nameAr: 'تركيا', nameEn: 'Turkey', flagCode: 'TR', logoUrl: getFlag('TR'), confederation: 'UEFA' },
  { id: 'cze', nameAr: 'جمهورية التشيك', nameEn: 'Czechia', flagCode: 'CZ', logoUrl: getFlag('CZ'), confederation: 'UEFA' },
  { id: 'bih', nameAr: 'البوسنة والهرسك', nameEn: 'Bosnia', flagCode: 'BA', logoUrl: getFlag('BA'), confederation: 'UEFA' },
  { id: 'can', nameAr: 'كندا', nameEn: 'Canada', flagCode: 'CA', logoUrl: getFlag('CA'), confederation: 'CONCACAF' },
  { id: 'mex', nameAr: 'المكسيك', nameEn: 'Mexico', flagCode: 'MX', logoUrl: getFlag('MX'), confederation: 'CONCACAF' },
  { id: 'usa', nameAr: 'الولايات المتحدة', nameEn: 'USA', flagCode: 'US', logoUrl: getFlag('US'), confederation: 'CONCACAF' },
  { id: 'pan', nameAr: 'بنما', nameEn: 'Panama', flagCode: 'PA', logoUrl: getFlag('PA'), confederation: 'CONCACAF' },
  { id: 'cuw', nameAr: 'كوراساو', nameEn: 'Curaçao', flagCode: 'CW', logoUrl: getFlag('CW'), confederation: 'CONCACAF' },
  { id: 'hai', nameAr: 'هايتي', nameEn: 'Haiti', flagCode: 'HT', logoUrl: getFlag('HT'), confederation: 'CONCACAF' },
  { id: 'nzl', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', flagCode: 'NZ', logoUrl: getFlag('NZ'), confederation: 'OFC' },
];

export const WORLD_CUP_2026 = {
  id: 'wc2026',
  nameAr: 'كأس العالم 2026',
  nameEn: 'FIFA World Cup 2026',
  logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/2026_FIFA_World_Cup_logo.svg',
  type: 'national',
  year: '2026'
};

export const ALKHOBAR_PAVILION = {
  id: 'p1',
  nameAr: 'بافيليون الخبر',
  nameEn: 'Pavilion Alkhobar',
  cityAr: 'الخبر',
  cityEn: 'Alkhobar',
  logoUrl: '',
  mapsUrl: 'https://maps.google.com/?q=Alkhobar+Saudi+Arabia'
};

const AST_OFFSET = 3;
const astDate = (month: number, day: number, hour: number, minute: number = 0): number => {
  return Date.UTC(2026, month - 1, day, hour - AST_OFFSET, minute);
};

const ast = (h: number, m: number = 0) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

export const MATCHES: Match[] = [
  // ========== SAUDI ARABIA - GROUP H ==========
  {
    id: 'h1', team1Id: 'ksa', team2Id: 'civ',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(22, 0), dateAr: '13 يونيو 2026', dateEn: 'June 13, 2026',
    groupAr: 'المجموعة ح', groupEn: 'Group H',
    timestamp: astDate(6, 13, 22),
    isSaudiMatch: true, isFeatured: true, isArabMatch: true,
    status: 'upcoming', isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'h2', team1Id: 'uru', team2Id: 'ksa',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(20, 0), dateAr: '18 يونيو 2026', dateEn: 'June 18, 2026',
    groupAr: 'المجموعة ح', groupEn: 'Group H',
    timestamp: astDate(6, 18, 20),
    isSaudiMatch: true, isFeatured: true,
    status: 'upcoming', isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'h3', team1Id: 'ksa', team2Id: 'swe',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(18, 0), dateAr: '24 يونيو 2026', dateEn: 'June 24, 2026',
    groupAr: 'المجموعة ح', groupEn: 'Group H',
    timestamp: astDate(6, 24, 18),
    isSaudiMatch: true, isFeatured: true,
    status: 'upcoming', isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200'
  },

  // ========== OPENING MATCH & KEY GROUP STAGE ==========
  {
    id: 'a1', team1Id: 'mex', team2Id: 'rsa',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(22, 0), dateAr: '11 يونيو 2026', dateEn: 'June 11, 2026',
    groupAr: 'المجموعة أ', groupEn: 'Group A',
    timestamp: astDate(6, 11, 22),
    isFeatured: true,
    status: 'upcoming', isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'g2', team1Id: 'mar', team2Id: 'bra',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(21, 0), dateAr: '13 يونيو 2026', dateEn: 'June 13, 2026',
    groupAr: 'المجموعة ج', groupEn: 'Group C',
    timestamp: astDate(6, 13, 21),
    isFeatured: true, isArabMatch: true,
    status: 'upcoming', isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'g3', team1Id: 'arg', team2Id: 'fra',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(23, 0), dateAr: '14 يونيو 2026', dateEn: 'June 14, 2026',
    groupAr: 'المجموعة د', groupEn: 'Group D',
    timestamp: astDate(6, 14, 23),
    isFeatured: true,
    status: 'upcoming', isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'g4', team1Id: 'usa', team2Id: 'par',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(20, 0), dateAr: '13 يونيو 2026', dateEn: 'June 13, 2026',
    groupAr: 'المجموعة و', groupEn: 'Group W',
    timestamp: astDate(6, 13, 20),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g5', team1Id: 'ger', team2Id: 'cuw',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(19, 0), dateAr: '14 يونيو 2026', dateEn: 'June 14, 2026',
    groupAr: 'المجموعة هـ', groupEn: 'Group E',
    timestamp: astDate(6, 14, 19),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g6', team1Id: 'eng', team2Id: 'cro',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(22, 0), dateAr: '17 يونيو 2026', dateEn: 'June 17, 2026',
    groupAr: 'المجموعة ل', groupEn: 'Group L',
    timestamp: astDate(6, 17, 22),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g7', team1Id: 'can', team2Id: 'bih',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(21, 0), dateAr: '12 يونيو 2026', dateEn: 'June 12, 2026',
    groupAr: 'المجموعة ب', groupEn: 'Group B',
    timestamp: astDate(6, 12, 21),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g8', team1Id: 'por', team2Id: 'tur',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(18, 0), dateAr: '19 يونيو 2026', dateEn: 'June 19, 2026',
    groupAr: 'المجموعة ر', groupEn: 'Group R',
    timestamp: astDate(6, 19, 18),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g9', team1Id: 'esp', team2Id: 'ned',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(22, 0), dateAr: '15 يونيو 2026', dateEn: 'June 15, 2026',
    groupAr: 'المجموعة س', groupEn: 'Group S',
    timestamp: astDate(6, 15, 22),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g10', team1Id: 'tun', team2Id: 'jpn',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(19, 0), dateAr: '20 يونيو 2026', dateEn: 'June 20, 2026',
    groupAr: 'المجموعة ف', groupEn: 'Group F',
    timestamp: astDate(6, 20, 19),
    isFeatured: true, isArabMatch: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g11', team1Id: 'egy', team2Id: 'qat',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(18, 0), dateAr: '16 يونيو 2026', dateEn: 'June 16, 2026',
    groupAr: 'المجموعة ك', groupEn: 'Group K',
    timestamp: astDate(6, 16, 18),
    isFeatured: true, isArabMatch: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g12', team1Id: 'jor', team2Id: 'por',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(21, 0), dateAr: '15 يونيو 2026', dateEn: 'June 15, 2026',
    groupAr: 'المجموعة ر', groupEn: 'Group R',
    timestamp: astDate(6, 15, 21),
    isFeatured: false, isArabMatch: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g13', team1Id: 'irq', team2Id: 'pan',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(17, 0), dateAr: '21 يونيو 2026', dateEn: 'June 21, 2026',
    groupAr: 'المجموعة ط', groupEn: 'Group T',
    timestamp: astDate(6, 21, 17),
    isFeatured: false, isArabMatch: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g14', team1Id: 'alg', team2Id: 'sui',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(20, 0), dateAr: '23 يونيو 2026', dateEn: 'June 23, 2026',
    groupAr: 'المجموعة ع', groupEn: 'Group Ayn',
    timestamp: astDate(6, 23, 20),
    isFeatured: false, isArabMatch: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g15', team1Id: 'sen', team2Id: 'gha',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(18, 0), dateAr: '12 يونيو 2026', dateEn: 'June 12, 2026',
    groupAr: 'المجموعة ب', groupEn: 'Group B',
    timestamp: astDate(6, 12, 18),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g16', team1Id: 'bra', team2Id: 'hai',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(19, 0), dateAr: '19 يونيو 2026', dateEn: 'June 19, 2026',
    groupAr: 'المجموعة ج', groupEn: 'Group C',
    timestamp: astDate(6, 19, 19),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g17', team1Id: 'can', team2Id: 'qat',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(20, 0), dateAr: '18 يونيو 2026', dateEn: 'June 18, 2026',
    groupAr: 'المجموعة ب', groupEn: 'Group B',
    timestamp: astDate(6, 18, 20),
    isFeatured: false, isArabMatch: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g18', team1Id: 'ger', team2Id: 'civ',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(21, 0), dateAr: '20 يونيو 2026', dateEn: 'June 20, 2026',
    groupAr: 'المجموعة هـ', groupEn: 'Group E',
    timestamp: astDate(6, 20, 21),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g19', team1Id: 'fra', team2Id: 'sen',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(22, 0), dateAr: '22 يونيو 2026', dateEn: 'June 22, 2026',
    groupAr: 'المجموعة ط', groupEn: 'Group T',
    timestamp: astDate(6, 22, 22),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g20', team1Id: 'bel', team2Id: 'ned',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(20, 0), dateAr: '25 يونيو 2026', dateEn: 'June 25, 2026',
    groupAr: 'المجموعة س', groupEn: 'Group S',
    timestamp: astDate(6, 25, 20),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g21', team1Id: 'eng', team2Id: 'sco',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(23, 0), dateAr: '21 يونيو 2026', dateEn: 'June 21, 2026',
    groupAr: 'المجموعة ل', groupEn: 'Group L',
    timestamp: astDate(6, 21, 23),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g22', team1Id: 'mex', team2Id: 'cze',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(20, 0), dateAr: '24 يونيو 2026', dateEn: 'June 24, 2026',
    groupAr: 'المجموعة أ', groupEn: 'Group A',
    timestamp: astDate(6, 24, 20),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g23', team1Id: 'ned', team2Id: 'por',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(19, 0), dateAr: '15 يونيو 2026', dateEn: 'June 15, 2026',
    groupAr: 'المجموعة س', groupEn: 'Group S',
    timestamp: astDate(6, 15, 19),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g24', team1Id: 'esp', team2Id: 'bel',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(22, 0), dateAr: '26 يونيو 2026', dateEn: 'June 26, 2026',
    groupAr: 'المجموعة س', groupEn: 'Group S',
    timestamp: astDate(6, 26, 22),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g25', team1Id: 'nor', team2Id: 'col',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(21, 0), dateAr: '15 يونيو 2026', dateEn: 'June 15, 2026',
    groupAr: 'المجموعة X', groupEn: 'Group X',
    timestamp: astDate(6, 15, 21),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g26', team1Id: 'arg', team2Id: 'ecu',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(17, 0), dateAr: '23 يونيو 2026', dateEn: 'June 23, 2026',
    groupAr: 'المجموعة د', groupEn: 'Group D',
    timestamp: astDate(6, 23, 17),
    isFeatured: true,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g27', team1Id: 'jpn', team2Id: 'aus',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(18, 0), dateAr: '17 يونيو 2026', dateEn: 'June 17, 2026',
    groupAr: 'المجموعة ف', groupEn: 'Group F',
    timestamp: astDate(6, 17, 18),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g28', team1Id: 'irn', team2Id: 'nzl',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(22, 0), dateAr: '16 يونيو 2026', dateEn: 'June 16, 2026',
    groupAr: 'المجموعة Y', groupEn: 'Group Y',
    timestamp: astDate(6, 16, 22),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g29', team1Id: 'kor', team2Id: 'irq',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(23, 0), dateAr: '25 يونيو 2026', dateEn: 'June 25, 2026',
    groupAr: 'المجموعة Z', groupEn: 'Group Z',
    timestamp: astDate(6, 25, 23),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
  {
    id: 'g30', team1Id: 'uzb', team2Id: 'aut',
    tournamentId: 'wc2026', mallId: 'p1',
    time: ast(17, 0), dateAr: '22 يونيو 2026', dateEn: 'June 22, 2026',
    groupAr: 'المجموعة Y', groupEn: 'Group Y',
    timestamp: astDate(6, 22, 17),
    isFeatured: false,
    status: 'upcoming', isActive: true,
  },
];

export const DEFAULT_VENUE_CONFIGS = (matchId: string, mallId: string = 'p1') => ({
  id: `${matchId}_${mallId}`,
  matchId,
  mallId,
  tiers: {
    standard: { price: 50, totalSeats: 2000, bookedSeats: 0 },
    premium: { price: 150, totalSeats: 500, bookedSeats: 0 },
    vip: { price: 350, totalSeats: 100, bookedSeats: 0 }
  }
});
