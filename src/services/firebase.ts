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
  const ref = collection(db, 'reservations');
  const q = !isAdmin && userId
    ? query(ref, where('userId', '==', userId))
    : query(ref);
  return onSnapshot(q,
    (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setter(data);
    },
    (error) => {
      console.warn('Reservations subscription error:', error.message);
    }
  );
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

export const syncLocalReservations = async (): Promise<number> => {
  try {
    const stored = JSON.parse(localStorage.getItem('pendingReservations') || '[]');
    if (!stored.length) return 0;
    let synced = 0;
    for (const res of stored) {
      try {
        await addDoc(collection(db, 'reservations'), res);
        synced++;
      } catch (e) {
        console.warn('Failed to sync reservation:', e);
      }
    }
    localStorage.removeItem('pendingReservations');
    return synced;
  } catch (e) {
    console.warn('Sync failed:', e);
    return 0;
  }
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

export const testFirestoreConnection = async (): Promise<{ ok: boolean; message: string; dbId: string }> => {
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  try {
    const testRef = doc(collection(db, '_connection_test'), `test_${Date.now()}`);
    await setDoc(testRef, { timestamp: Date.now(), message: 'connection test' });
    await deleteDoc(testRef);
    return { ok: true, message: `Connected to database: ${dbId}`, dbId };
  } catch (err: any) {
    let message = err.message || String(err);
    if (message.includes('multi-db')) {
      message += ' - The named database might not exist. Try using (default) database.';
    }
    if (message.includes('permission')) {
      message += ' - Check Firestore security rules.';
    }
    if (message.includes('network')) {
      message += ' - Check network/firewall or enable Firestore API.';
    }
    return { ok: false, message: `DB: ${dbId} — ${message}`, dbId };
  }
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
