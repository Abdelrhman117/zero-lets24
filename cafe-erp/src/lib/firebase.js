// ==========================================
// 🔧 ضع هنا بيانات Firebase الخاصة بك
// ==========================================
// 1. اذهب إلى https://console.firebase.google.com
// 2. أنشئ مشروع جديد أو استخدم مشروع موجود
// 3. Project Settings → Your apps → Web app
// 4. انسخ firebaseConfig والصقها هنا

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
}

// ==========================================
// Firebase Services — لا تعدّل هنا
// ==========================================
import { initializeApp }                          from 'firebase/app'
import { getAuth }                                from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getFirestore(app)

// تفعيل العمل أوفلاين
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') console.warn('Offline persistence: multiple tabs open')
  else if (err.code === 'unimplemented')  console.warn('Offline persistence: not supported in this browser')
})

export default app
