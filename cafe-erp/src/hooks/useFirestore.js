import { useEffect } from 'react'
import { subscribePlatform, subscribeCafe } from '../lib/firestore'
import { useStore } from '../store'

export function useFirestore() {
  const { currentUser, setPlatform, setCafeData, setIsOnline, setSyncStatus } = useStore()

  // Online / offline
  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Platform subscription (always active)
  useEffect(() => {
    const unsub = subscribePlatform(
      (snap) => { if (snap.exists()) setPlatform(snap.data()) },
      (err)  => console.error('Platform subscription error:', err)
    )
    return unsub
  }, [])

  // Cafe subscription (only when logged in with a cafeId)
  useEffect(() => {
    if (!currentUser?.cafeId) return
    const unsub = subscribeCafe(
      currentUser.cafeId,
      (snap) => {
        if (snap.exists()) setCafeData(snap.data())
        if (snap.metadata?.hasPendingWrites) setSyncStatus('saving')
      },
      (err) => console.error('Cafe subscription error:', err)
    )
    return unsub
  }, [currentUser?.cafeId])
}
