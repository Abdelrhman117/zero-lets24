import { Wifi, WifiOff, RefreshCw, AlertCircle, Bell, AlertTriangle } from 'lucide-react'
import { useStore, selectLowStock, selectExpiringProducts } from '../store'

export default function StatusBar({ onNavigate }) {
  const { isOnline, syncStatus, currentUser } = useStore()
  const lowStock = useStore(selectLowStock(50))
  const { expired, nearExpiry } = useStore(selectExpiringProducts)

  const barColor =
    !isOnline       ? 'bg-rose-600' :
    syncStatus === 'error'  ? 'bg-rose-600' :
    syncStatus === 'saving' ? 'bg-amber-500' :
    syncStatus === 'saved'  ? 'bg-emerald-500' :
    'bg-emerald-600'

  const statusText =
    !isOnline       ? 'أوفلاين — سيتم الرفع عند الاتصال' :
    syncStatus === 'error'  ? '❌ خطأ في الحفظ' :
    syncStatus === 'saving' ? 'جاري الحفظ...' :
    syncStatus === 'saved'  ? '✅ تم الحفظ' :
    'متصل ✓'

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] text-[10px] md:text-xs font-bold py-1.5 px-3 flex justify-between items-center text-white ${barColor} transition-colors duration-300`}>
      {/* Left: status */}
      <div className="flex items-center gap-1.5">
        {!isOnline
          ? <WifiOff size={12} />
          : syncStatus === 'saving'
          ? <RefreshCw size={12} className="animate-spin" />
          : syncStatus === 'error'
          ? <AlertCircle size={12} />
          : <Wifi size={12} />
        }
        <span className="truncate max-w-[200px]">{statusText}</span>
      </div>

      {/* Center: alerts */}
      {currentUser && (
        <div className="flex items-center gap-2">
          {lowStock.length > 0 && (
            <button onClick={() => onNavigate?.('inventory')} className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30 transition-colors">
              <Bell size={10} /> {lowStock.length} منخفض
            </button>
          )}
          {(expired.length + nearExpiry.length) > 0 && (
            <button onClick={() => onNavigate?.('products')} className="flex items-center gap-1 bg-amber-400/30 px-2 py-0.5 rounded-full hover:bg-amber-400/40 transition-colors">
              <AlertTriangle size={10} /> {expired.length + nearExpiry.length} صلاحيات
            </button>
          )}
        </div>
      )}

      {/* Right: dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        {isOnline && syncStatus !== 'error' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${!isOnline || syncStatus === 'error' ? 'bg-rose-300' : 'bg-white'}`} />
      </span>
    </div>
  )
}
