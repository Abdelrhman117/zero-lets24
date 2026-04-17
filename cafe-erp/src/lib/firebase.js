// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_h5f_fpqVsrqe_nEexbKPAQnRQNw4ZCU",
  authDomain: "zerolets-3dcbf.firebaseapp.com",
  projectId: "zerolets-3dcbf",
  storageBucket: "zerolets-3dcbf.firebasestorage.app",
  messagingSenderId: "855856820755",
  appId: "1:855856820755:web:7cc84ae5fe485f78c285e6",
  measurementId: "G-0594R4YVX4"
};

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
