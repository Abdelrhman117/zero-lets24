import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useStore } from '../store'

export function useAuth() {
  const { platform, setCurrentUser } = useStore()
  const [loading, setLoading]  = useState(false)
  const [error,   setError]    = useState('')

  // resolve user role from tenants list
  const resolveUser = (email) => {
    const em = email.toLowerCase()

    // Super Admin
    if (em === (import.meta.env.VITE_OWNER_EMAIL || 'owner@coffeeerp.app')) {
      return { role: 'super_admin', cafeId: null, cafeName: null, displayName: 'مالك المنصة' }
    }

    for (const t of (platform?.tenants || [])) {
      if (t.adminEmail?.toLowerCase()   === em) return { role: 'admin',   cafeId: t.id, cafeName: t.name, displayName: `مدير — ${t.name}` }
      if (t.cashierEmail?.toLowerCase() === em) return { role: 'cashier', cafeId: t.id, cafeName: t.name, displayName: `كاشير — ${t.name}` }
    }
    return null
  }

  const login = async (email, password) => {
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
      const meta = resolveUser(cred.user.email)
      if (!meta) {
        await fbSignOut(auth)
        setError('هذا البريد غير مسجل في النظام. تواصل مع مالك المنصة.')
        return false
      }
      // Check subscription
      if (meta.cafeId) {
        const tenant = platform.tenants.find(t => t.id === meta.cafeId)
        if (tenant?.status !== 'active') {
          await fbSignOut(auth)
          setError('اشتراك الكافيه موقوف. تواصل مع مالك المنصة.')
          return false
        }
        if (tenant?.subscriptionEnds && new Date(tenant.subscriptionEnds) < new Date()) {
          await fbSignOut(auth)
          setError('انتهى اشتراك الكافيه. يرجى التجديد.')
          return false
        }
      }
      setCurrentUser({ uid: cred.user.uid, email: cred.user.email, ...meta })
      return true
    } catch (e) {
      const msgs = {
        'auth/wrong-password':       'كلمة المرور غير صحيحة.',
        'auth/invalid-credential':   'البريد أو كلمة المرور غير صحيحة.',
        'auth/user-not-found':       'البريد الإلكتروني غير مسجل في Firebase.',
        'auth/too-many-requests':    'محاولات كثيرة. انتظر قبل المحاولة مجدداً.',
        'auth/network-request-failed': 'تحقق من الاتصال بالإنترنت.'
      }
      setError(msgs[e.code] || `خطأ: ${e.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fbSignOut(auth)
    setCurrentUser(null)
  }

  return { login, logout, loading, error, setError }
}
