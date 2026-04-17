import { Coffee, LayoutDashboard, FileText, ClipboardList, Package, ShoppingCart,
         Utensils, Users, Receipt, Tag, Gamepad2, LogOut, X, Sun, Moon, Bell, AlertTriangle } from 'lucide-react'
import { useStore, selectLowStock, selectExpiringProducts } from '../store'
import { useAuth } from '../hooks/useAuth'
import { Toggle } from '../components/UI'

const NAV = [
  { id: 'dashboard',   label: 'لوحة القيادة',   icon: LayoutDashboard },
  { id: 'pos',         label: 'نقطة البيع',       icon: ShoppingCart    },
  { id: 'reports',     label: 'التقارير',          icon: FileText        },
  { id: 'shifts',      label: 'الورديات',          icon: ClipboardList   },
  { id: 'inventory',   label: 'المواد الخام',      icon: Package         },
  { id: 'products',    label: 'المنتجات',          icon: Coffee          },
  { id: 'offers',      label: 'العروض',            icon: Tag             },
  { id: 'tables',      label: 'الصالة',            icon: Utensils        },
  { id: 'playstation', label: 'بلايستيشن',         icon: Gamepad2        },
  { id: 'hr',          label: 'الموظفين والرواتب', icon: Users           },
  { id: 'expenses',    label: 'المصروفات',          icon: Receipt         },
]

export default function Sidebar({ currentRoute, onNavigate, onClose }) {
  const { currentUser, isDarkMode, setIsDarkMode, isTaxEnabled, toggleTax, platform } = useStore()
  const { logout } = useAuth()
  const lowStock = useStore(selectLowStock(50))
  const { expired } = useStore(selectExpiringProducts)

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-black flex items-center gap-2 text-slate-800 dark:text-white">
            <Coffee className="text-indigo-500 w-5 h-5" />
            {platform?.appName}
          </h2>
          <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-0.5 font-bold truncate max-w-[180px]">
            {currentUser?.cafeName}
          </p>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-500 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {NAV.map(item => {
          const Icon = item.icon
          const badge = item.id === 'inventory' && lowStock.length > 0 ? lowStock.length
                      : item.id === 'products'  && expired.length  > 0 ? expired.length
                      : null
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose?.() }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all text-sm
                ${currentRoute === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white'
                }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-right">{item.label}</span>
              {badge && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
        <div className="px-1">
          <Toggle label="ضريبة 14%" checked={isTaxEnabled} onChange={toggleTax} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-300 hover:text-indigo-600 transition-colors flex-1 flex justify-center">
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button onClick={logout} className="flex-1 flex justify-center gap-1.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white font-bold transition-colors text-sm">
            <LogOut size={17} /> خروج
          </button>
        </div>
      </div>
    </div>
  )
}
