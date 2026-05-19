export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type SeatTier = 'vip' | 'premium' | 'standard';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';
export type AttendanceStatus = 'attended' | 'not_attended';
export type PaymentStatus = 'paid' | 'unpaid';
export type TournamentType = 'clubs' | 'national' | 'mixed';

export interface Mall {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  logoUrl?: string;
  galleryUrls?: string[];
  mapsUrl?: string;
}

export interface Team {
  id: string;
  nameAr: string;
  nameEn: string;
  flagCode: string;
  logoUrl?: string;
  confederation?: string;
}

export interface Tournament {
  id: string;
  nameAr: string;
  nameEn: string;
  logoUrl?: string;
  type?: TournamentType;
  year?: string;
  isActive?: boolean;
  createdAt?: number;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  tournamentId: string;
  mallId: string;
  timestamp: number;
  time: string;
  dateAr: string;
  dateEn: string;
  groupAr: string;
  groupEn: string;
  status: 'upcoming' | 'live' | 'ended';
  isActive?: boolean;
  isArabMatch?: boolean;
  isSaudiMatch?: boolean;
  isFeatured?: boolean;
  round?: string;
  venueAr?: string;
  venueEn?: string;
}

export interface TierConfig {
  price: number;
  totalSeats: number;
  bookedSeats: number;
}

export interface MatchVenueConfig {
  id: string;
  matchId: string;
  mallId: string;
  tiers: Record<SeatTier, TierConfig>;
}

export interface Reservation {
  id?: string;
  serial: string;
  name: string;
  phone: string;
  guests: number;
  matchId: string;
  mallId: string;
  placeType: SeatTier;
  status: ReservationStatus;
  attendanceStatus: AttendanceStatus;
  paymentStatus: PaymentStatus;
  price: number;
  createdAt: number;
  seatNumbers?: string[];
  userId?: string;
  notes?: string;
  waSent?: boolean;
}

export interface AdminSettings {
  whatsappNumber: string;
  isBookingEnabled: boolean;
  pavilionNameAr: string;
  pavilionNameEn: string;
  adminEmail: string;
}

export interface Translation {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  reservationTitle: string;
  reservationSubtitle: string;
  footerText: string;
  bookedSuccessfully: string;
  adminPanel: string;
  login: string;
  logout: string;
  confirm: string;
  cancel: string;
  name: string;
  phone: string;
  guestsCount: string;
  match: string;
  status: string;
  date: string;
  selectMatch: string;
  loading: string;
  noReservations: string;
  back: string;
  next: string;
  bookNow: string;
  pavilionDescription: string;
  highlights: string;
  arabMatches: string;
  globalMatches: string;
  alKhobarPavilion: string;
  results: string;
  active: string;
  hidden: string;
  allMatches: string;
  upcoming: string;
  manageMatches: string;
  manageTournaments: string;
  manageTeams: string;
  manageVenues: string;
  addTournament: string;
  addTeam: string;
  addMatch: string;
  tournament: string;
  homeTeam: string;
  awayTeam: string;
  final: string;
  semiFinal: string;
  groupStage: string;
  roundOf16: string;
  roundOf8: string;
  firstLeg: string;
  secondLeg: string;
  saudiLeague: string;
  africaChampions: string;
  downloadTicket: string;
  reservationExists: string;
  ticketTitle: string;
  ticketSubtitle: string;
  contactUs: string;
  placeType: string;
  vip: string;
  premium: string;
  standard: string;
  selectPlace: string;
  reserveOnWhatsapp: string;
  step: string;
  finish: string;
  waMessageTemplate: string;
  malls: string;
  cities: string;
  addMall: string;
  checkIn: string;
  attended: string;
  notAttended: string;
  jsonImport: string;
  pasteJson: string;
  importSuccess: string;
  importError: string;
  price: string;
  total: string;
  booked: string;
  mall: string;
  whatsappBooking: string;
  nextStep: string;
  pavilionName: string;
  fullName: string;
  confirmBooking: string;
  schedule: string;
  searchTeam: string;
  allDates: string;
  noMatches: string;
  saudiMatch: string;
  venue: string;
  guests: string;
  orderSummary: string;
  paymentStatus: string;
  attendanceStatus: string;
  totalRevenue: string;
  pendingPayments: string;
  totalGuests: string;
  checkins: string;
  bookings: string;
  matches: string;
  system: string;
  reSeed: string;
  bulkImport: string;
  processImport: string;
  saveMatch: string;
  cancelMatch: string;
  addSingleMatch: string;
  scheduleManagement: string;
  seatsAvailable: string;
  seatsBooked: string;
  seatType: string;
  editSeats: string;
  saveSeats: string;
  uploadCsv: string;
  uploadExcel: string;
  uploadSuccess: string;
  uploadError: string;
  tournamentType: string;
  clubs: string;
  nationalTeams: string;
  matchTime: string;
  ast: string;
  sortByNearest: string;
  filterByTeam: string;
  yourReservation: string;
  shareTicket: string;
  close: string;
  adminLoginTitle: string;
  adminLoginDesc: string;
  signInGoogle: string;
  cancelAccess: string;
  orderId: string;
  team: string;
  group: string;
  round: string;
  confirmAttendance: string;
  markPaid: string;
  confirmPayment: string;
  totalBooked: string;
  remainingSeats: string;
}
