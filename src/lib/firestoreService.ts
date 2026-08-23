import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UbaDcaRecord,
  ForeignStockBuyRecord,
  ForeignStockSellRecord,
  NigerianStockBuyRecord,
  NigerianStockSellRecord,
  EbookDcaRecord,
  CommercialPaperRecord,
  TreasuryBillRecord,
  MutualFundRecord,
  FgnBondRecord,
  GoldEtfBuyRecord,
  GoldEtfSellRecord,
  LockedSavingsRecord,
  AppDocument,
  AppSettings
} from '../types';

// Helper to get collection reference under users/{uid}/{collectionName}
export const getUserSubcollectionRef = (uid: string, collectionName: string) => {
  return collection(db, 'users', uid, collectionName);
};

// Generic single record upsert with userId attachment
export const saveUserRecord = async (
  uid: string, 
  collectionName: string, 
  recordId: string, 
  data: Record<string, any>
) => {
  if (!uid) throw new Error('Cannot save record: User is not authenticated.');
  const docRef = doc(db, 'users', uid, collectionName, recordId);
  const payload = {
    ...data,
    id: recordId,
    userId: uid,
    updatedAt: new Date().toISOString()
  };
  await setDoc(docRef, payload, { merge: true });
};

// Generic single record deletion
export const deleteUserRecord = async (
  uid: string, 
  collectionName: string, 
  recordId: string
) => {
  if (!uid) throw new Error('Cannot delete record: User is not authenticated.');
  const docRef = doc(db, 'users', uid, collectionName, recordId);
  await deleteDoc(docRef);
};

// User settings saving
export const saveUserSettings = async (uid: string, settings: Partial<AppSettings>) => {
  if (!uid) return;
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, { settings, updatedAt: new Date().toISOString() }, { merge: true });
};

// Bulk import to Firestore in chunks (under 500 ops per batch)
export const bulkImportToFirestore = async (uid: string, payload: {
  ubaDcaRecords?: UbaDcaRecord[];
  foreignStockBuys?: ForeignStockBuyRecord[];
  foreignStockSells?: ForeignStockSellRecord[];
  nigerianStockBuys?: NigerianStockBuyRecord[];
  nigerianStockSells?: NigerianStockSellRecord[];
  ebookDcaRecords?: EbookDcaRecord[];
  commercialPaperRecords?: CommercialPaperRecord[];
  treasuryBillRecords?: TreasuryBillRecord[];
  mutualFundRecords?: MutualFundRecord[];
  fgnBondRecords?: FgnBondRecord[];
  goldEtfBuys?: GoldEtfBuyRecord[];
  goldEtfSells?: GoldEtfSellRecord[];
  lockedSavingsRecords?: LockedSavingsRecord[];
  documents?: AppDocument[];
  settings?: AppSettings;
}) => {
  if (!uid) throw new Error('Cannot perform bulk import: Authenticated UID is required.');

  // Collections mapping
  const datasetMap: Array<{ name: string; items: any[] }> = [
    { name: 'uba_dca', items: payload.ubaDcaRecords || [] },
    { name: 'foreign_stock_buys', items: payload.foreignStockBuys || [] },
    { name: 'foreign_stock_sells', items: payload.foreignStockSells || [] },
    { name: 'nigerian_stock_buys', items: payload.nigerianStockBuys || [] },
    { name: 'nigerian_stock_sells', items: payload.nigerianStockSells || [] },
    { name: 'ebook_dca', items: payload.ebookDcaRecords || [] },
    { name: 'commercial_papers', items: payload.commercialPaperRecords || [] },
    { name: 'treasury_bills', items: payload.treasuryBillRecords || [] },
    { name: 'mutual_funds', items: payload.mutualFundRecords || [] },
    { name: 'fgn_bonds', items: payload.fgnBondRecords || [] },
    { name: 'gold_etf_buys', items: payload.goldEtfBuys || [] },
    { name: 'gold_etf_sells', items: payload.goldEtfSells || [] },
    { name: 'locked_savings', items: payload.lockedSavingsRecords || [] },
    { name: 'documents', items: payload.documents || [] },
  ];

  let batch = writeBatch(db);
  let count = 0;

  // Save settings first
  if (payload.settings) {
    const userDocRef = doc(db, 'users', uid);
    batch.set(userDocRef, { settings: payload.settings, updatedAt: new Date().toISOString() }, { merge: true });
    count++;
  }

  for (const group of datasetMap) {
    for (const item of group.items) {
      const id = item.id || `${group.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const docRef = doc(db, 'users', uid, group.name, id);
      batch.set(docRef, {
        ...item,
        id,
        userId: uid,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      count++;
      if (count >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
  }

  if (count > 0) {
    await batch.commit();
  }
};
