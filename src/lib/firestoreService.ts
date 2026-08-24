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
import { db, auth } from './firebase';
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
  CryptoInvestmentRecord,
  CryptoDayTradeRecord,
  AppDocument,
  AppSettings,
  MarketReferenceRecord
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  const docPath = `users/${uid}/${collectionName}/${recordId}`;
  try {
    const docRef = doc(db, 'users', uid, collectionName, recordId);
    const payload = {
      ...data,
      id: recordId,
      userId: uid,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
};

// Generic single record deletion
export const deleteUserRecord = async (
  uid: string, 
  collectionName: string, 
  recordId: string
) => {
  if (!uid) throw new Error('Cannot delete record: User is not authenticated.');
  const docPath = `users/${uid}/${collectionName}/${recordId}`;
  try {
    const docRef = doc(db, 'users', uid, collectionName, recordId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
};

// User settings saving
export const saveUserSettings = async (uid: string, settings: Partial<AppSettings>) => {
  if (!uid) return;
  const docPath = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
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
  cryptoInvestments?: CryptoInvestmentRecord[];
  cryptoDayTrades?: CryptoDayTradeRecord[];
  documents?: AppDocument[];
  marketReferences?: MarketReferenceRecord[];
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
    { name: 'crypto_investments', items: payload.cryptoInvestments || [] },
    { name: 'crypto_day_trades', items: payload.cryptoDayTrades || [] },
    { name: 'documents', items: payload.documents || [] },
    { name: 'market_references', items: payload.marketReferences || [] },
  ];

  try {
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
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};
