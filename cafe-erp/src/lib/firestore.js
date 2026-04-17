import { db } from './firebase'
import {
  doc, setDoc, getDoc, onSnapshot, collection,
  query, where, orderBy, limit, getDocs
} from 'firebase/firestore'

// ─── Platform (Super Admin) ───────────────────────────────
export const PLATFORM_DOC = () => doc(db, 'erp_platform', 'config')

export const subscribePlatform = (cb, errCb) =>
  onSnapshot(PLATFORM_DOC(), cb, errCb)

export const savePlatform = (data) =>
  setDoc(PLATFORM_DOC(), { ...data, updatedAt: Date.now() }, { merge: true })

// ─── Cafe data ────────────────────────────────────────────
export const CAFE_DOC = (cafeId) => doc(db, 'erp_cafes', cafeId)

export const subscribeCafe = (cafeId, cb, errCb) =>
  onSnapshot(CAFE_DOC(cafeId), cb, errCb)

export const saveCafe = (cafeId, data) =>
  setDoc(CAFE_DOC(cafeId), { ...data, updatedAt: Date.now() }, { merge: true })

// ─── Firestore rules reminder ─────────────────────────────
/*
  الصق هذا في Firestore Rules:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /erp_platform/{doc} {
        allow read, write: if request.auth != null;
      }
      match /erp_cafes/{cafeId} {
        allow read, write: if request.auth != null;
      }
    }
  }
*/
