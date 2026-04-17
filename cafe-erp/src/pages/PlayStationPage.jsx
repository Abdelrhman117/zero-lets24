import { useState, useEffect, useRef } from 'react'
import { Gamepad2, Plus, Trash2, Play, Power, Clock } from 'lucide-react'
import { useStore } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Btn, DataTable, Badge } from '../components/UI'

// Live timer for active sessions
function LiveTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startTime) / 1000))
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 10000)
    return () => clearInterval(id)
  }, [startTime])
  const min = Math.floor(elapsed / 60)
  const hrs = Math.floor(min / 60)
  const rem = min % 60
  return <span>{hrs > 0 ? `${hrs}س ` : ''}{rem}د</span>
}

export default function PlayStationPage() {
  const { psDevices, psSessions, currentUser, upsertPsDevice, deletePsDevice, startPsSession, endPsSession } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [form, setForm] = useState({ name: '', hourlyRate: '' })
  const [tick, setTick] = useState(0)

  // Refresh cost display every minute
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    upsertPsDevice({ name: form.name, hourlyRate: parseFloat(form.hourlyRate) || 0 })
    setShowModal(false)
    setForm({ name: '', hourlyRate: '' })
  }

  const getActiveSession = (deviceId) => psSessions.find(s => s.deviceId === deviceId && s.status === 'active')
  const getLiveCost = (session, device) => {
    const min = Math.ceil((Date.now() - session.startTime) / 60000)
    return Math.ceil(min / 60) * (device.hourlyRate || 0)
  }

  const endedSessions = [...psSessions.filter(s => s.status === 'ended')].reverse().slice(0, 30)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <PageHeader
        icon={<Gamepad2 size={28} />}
        title="سيستيم بلايستيشن"
        action={<Btn onClick={() => setShowModal(true)}><Plus size={17} /> إضافة جهاز</Btn>}
      />

      {/* Devices grid */}
      {!psDevices.length ? (
        <div className="text-center py-20 text-slate-400">
          <Gamepad2 className="w-20 h-20 mx-auto mb-4 opacity-20" />
          <p className="font-bold text-lg">لا توجد أجهزة مسجلة</p>
          <p className="text-sm mt-2">أضف أجهزة بلايستيشن لتتبع الجلسات وإصدار الفواتير تلقائياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {psDevices.map(device => {
            const session  = getActiveSession(device.id)
            const liveCost = session ? getLiveCost(session, device) : 0
            return (
              <div key={device.id} className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 shadow-sm transition-all ${session ? 'border-emerald-400 dark:border-emerald-600 shadow-emerald-100 dark:shadow-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-800 dark:text-white">{device.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-0.5 flex items-center gap-1">
                      <Clock size={12} /> {device.hourlyRate} ج / ساعة
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${session ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    {session ? '🟢 شغال' : '⚪ فاضي'}
                  </span>
                </div>

                {session && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 mb-4 space-y-1.5 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">🕐 بدأ: {session.startTimeStr}</p>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      ⏱ المدة: <LiveTimer startTime={session.startTime} />
                    </p>
                    <p className="text-base font-black text-emerald-600">
                      💰 التكلفة الحالية: {liveCost} ج
                    </p>
                  </div>
                )}

                {session ? (
                  <button onClick={() => endPsSession(session.id)}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-600/20">
                    <Power size={16} /> إنهاء الجلسة وإصدار فاتورة
                  </button>
                ) : (
                  <button onClick={() => startPsSession(device.id, currentUser?.displayName)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20">
                    <Play size={16} /> بدء جلسة
                  </button>
                )}

                <button onClick={() => setDeleteId(device.id)} className="mt-2 w-full text-xs text-slate-400 hover:text-rose-500 font-bold py-1.5 transition-colors">
                  حذف الجهاز
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Session history */}
      {endedSessions.length > 0 && (
        <div>
          <h3 className="font-black text-xl text-slate-800 dark:text-white mb-4">سجل الجلسات المنتهية</h3>
          <DataTable
            headers={[
              { label: 'الجهاز' }, { label: 'الكاشير' }, { label: 'البداية' },
              { label: 'النهاية' }, { label: 'المدة', center: true }, { label: 'التكلفة', center: true }
            ]}
          >
            {endedSessions.map(s => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
                <td className="p-4 font-bold text-slate-800 dark:text-white">{s.deviceName}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{s.cashierName}</td>
                <td className="p-4 text-xs text-slate-500">{s.startTimeStr}</td>
                <td className="p-4 text-xs text-slate-500">{s.endTimeStr}</td>
                <td className="p-4 text-center"><Badge color="indigo">{s.durationMin} د</Badge></td>
                <td className="p-4 text-center font-black text-indigo-600 dark:text-indigo-400">{s.cost} ج</td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {showModal && (
        <Modal title="إضافة جهاز بلايستيشن" onClose={() => setShowModal(false)} size="sm">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم الجهاز" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: PS5 رقم 1" />
            <Input label="سعر الساعة (ج)" required type="number" step="any" min="0" value={form.hourlyRate}
              onChange={e => setForm({ ...form, hourlyRate: e.target.value })} placeholder="50" />
            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ الجهاز</Btn>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDelete
          message="سيتم حذف الجهاز وجميع جلساته."
          onConfirm={() => { deletePsDevice(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
