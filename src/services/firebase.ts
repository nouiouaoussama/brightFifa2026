import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  addDoc,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export const subscribeToCollection = (collectionName: string, setter: (data: any[]) => void) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    setter(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const subscribeToReservations = (userId: string | null, isAdmin: boolean, setter: (data: any[]) => void) => {
  let q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
  if (!isAdmin && userId) {
    q = query(collection(db, 'reservations'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  }
  return onSnapshot(q, (snapshot) => {
    setter(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const updateDocument = (collectionName: string, id: string, updates: any) => {
  return updateDoc(doc(db, collectionName, id), updates);
};

export const addDocument = (collectionName: string, data: any) => {
  return addDoc(collection(db, collectionName), data);
};

export const setDocument = (collectionName: string, id: string, data: any) => {
  return setDoc(doc(db, collectionName, id), data);
};

export const deleteDocument = (collectionName: string, id: string) => {
  return deleteDoc(doc(db, collectionName, id));
};

export const seedInitialData = async (teams: any[], matches: any[], tournament: any, mall: any) => {
  const batch = writeBatch(db);

  batch.set(doc(db, 'tournaments', tournament.id), tournament);
  batch.set(doc(db, 'malls', mall.id), mall);

  for (const team of teams) {
    batch.set(doc(db, 'teams', team.id), team);
  }

  for (const m of matches) {
    batch.set(doc(db, 'matches', m.id), m);
    const configId = `${m.id}_${mall.id}`;
    batch.set(doc(db, 'matchVenueConfigs', configId), {
      id: configId,
      matchId: m.id,
      mallId: mall.id,
      tiers: {
        standard: { price: 50, totalSeats: 2000, bookedSeats: 0 },
        premium: { price: 150, totalSeats: 500, bookedSeats: 0 },
        vip: { price: 350, totalSeats: 100, bookedSeats: 0 }
      }
    });
  }

  return batch.commit();
};

export const bulkImportMatches = async (matches: any[], mallId: string) => {
  const batch = writeBatch(db);
  
  for (const m of matches) {
    const matchId = m.id || `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const matchData = {
      ...m,
      id: matchId,
      isActive: true,
      status: 'upcoming',
      timestamp: m.timestamp || Date.now()
    };
    batch.set(doc(db, 'matches', matchId), matchData);
    
    const configId = `${matchId}_${mallId}`;
    batch.set(doc(db, 'matchVenueConfigs', configId), {
      id: configId,
      matchId,
      mallId,
      tiers: {
        standard: { price: 50, totalSeats: 2000, bookedSeats: 0 },
        premium: { price: 150, totalSeats: 500, bookedSeats: 0 },
        vip: { price: 350, totalSeats: 100, bookedSeats: 0 }
      }
    });
  }
  
  return batch.commit();
};

export const importFromCsv = async (csvData: any[], mallId: string, tournamentId: string) => {
  const batch = writeBatch(db);
  
  for (const row of csvData) {
    const matchId = `csv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const matchData = {
      id: matchId,
      team1Id: row.team1Id || row.homeTeam,
      team2Id: row.team2Id || row.awayTeam,
      tournamentId: tournamentId,
      mallId: mallId,
      time: row.time || '20:00',
      dateAr: row.dateAr || row.date,
      dateEn: row.dateEn || row.date,
      groupAr: row.groupAr || row.group,
      groupEn: row.groupEn || row.group,
      timestamp: row.timestamp ? Number(row.timestamp) : Date.now(),
      isActive: true,
      status: 'upcoming'
    };
    batch.set(doc(db, 'matches', matchId), matchData);
    
    const configId = `${matchId}_${mallId}`;
    batch.set(doc(db, 'matchVenueConfigs', configId), {
      id: configId,
      matchId,
      mallId,
      tiers: {
        standard: { price: Number(row.standardPrice) || 50, totalSeats: Number(row.standardSeats) || 2000, bookedSeats: 0 },
        premium: { price: Number(row.premiumPrice) || 150, totalSeats: Number(row.premiumSeats) || 500, bookedSeats: 0 },
        vip: { price: Number(row.vipPrice) || 350, totalSeats: Number(row.vipSeats) || 100, bookedSeats: 0 }
      }
    });
  }
  
  return batch.commit();
};

export const createVenueConfig = async (matchId: string, mallId: string) => {
  const configId = `${matchId}_${mallId}`;
  await setDoc(doc(db, 'matchVenueConfigs', configId), {
    id: configId,
    matchId,
    mallId,
    tiers: {
      standard: { price: 50, totalSeats: 2000, bookedSeats: 0 },
      premium: { price: 150, totalSeats: 500, bookedSeats: 0 },
      vip: { price: 350, totalSeats: 100, bookedSeats: 0 }
    }
  });
};
