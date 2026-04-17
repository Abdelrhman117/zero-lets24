import { useState } from 'react'
import { Users, Plus, Trash2, User, Download, X } from 'lucide-react'
import { useStore } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Btn, DataTable, Badge } from '../components/UI'
import { exportEmployeeReport } from '../lib/pdf'

function NumberCell({ value, onSave, color }) {
  const [val, setVal] = useState(value || '')
  return (
    <input type="number" min="0" step="any" placeholder="0" value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onSave(val === '' ? 0 : parseFloat(val))}
      className={`w-24 p-2 text-center border-2 rounded-xl bg-transparent focus:outline-none font-bold text-sm transition-colors dark:border-slate-600 ${color}`}
    />
  )
}

export default function HRPage() {
  const { employees, orders, shifts, currentUser, upsertEmployee, deleteEmployee } = useStore()
  const [showModal,   setShowModal]   = useState(false)
  const [deleteId,    setDeleteId]    = useState(null)
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [form, setForm] = useState({ name: '', salary: '' })

  const handleSave = (e) => {
    e.preventDefault()
    upsertEmployee({ name: form.name, salary: parseFloat(form.salary) })
    setShowModal(false)
    setForm({ name: '', salary: '' })
  }

  const handleExport = (emp) => exportEmployeeReport({ employee: emp, orders, shifts, cafeName: currentUser?.cafeName || '' })

  const empOrders = (emp) => orders.filter(o => o.cashierName === emp.name)
  const empTotal  = (emp) => empOrders(emp).reduce((s, o) => s + o.total, 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<Users size={28} />}
        title="الموظفين والرواتب"
        action={<Btn onClick={() => setShowModal(true)}><Plus size={17} /> موظف جديد</Btn>}
      />

      <DataTable
        headers={[
          { label: 'الاسم' }, { label: 'الراتب' },
          { label: 'سلفة' }, { label: 'خصم' },
          { label: 'الصافي', center: true }, { label: 'المبيعات', center: true },
          { label: 'تقرير', center: true }, { label: 'حذف', center: true }
        ]}
        empty={!employees.length ? 'لا يوجد موظفون مسجلون' : null}
      >
        {employees.map(emp => {
          const net = emp.salary - (emp.advances || 0) - (emp.deductions || 0)
          return (
            <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
              <td className="p-4 font-black text-slate-800 dark:text-white">{emp.name}</td>
              <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{emp.salary} ج</td>
              <td className="p-2">
                <NumberCell value={emp.advances} color="text-amber-500 focus:border-amber-400 border-amber-200 bg-amber-50 dark:bg-amber-900/20"
                  onSave={v => upsertEmployee({ ...emp, advances: v })} />
              </td>
              <td className="p-2">
                <NumberCell value={emp.deductions} color="text-rose-500 focus:border-rose-400 border-rose-200 bg-rose-50 dark:bg-rose-900/20"
                  onSave={v => upsertEmployee({ ...emp, deductions: v })} />
              </td>
              <td className="p-4 text-center">
                <span className={`font-black text-base ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{net} ج</span>
              </td>
              <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                {empTotal(emp).toFixed(2)} ج
              </td>
              <td className="p-4 text-center">
                <button onClick={() => setSelectedEmp(emp)}
                  className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto transition-colors">
                  <User size={12} /> عرض
                </button>
              </td>
              <td className="p-4 text-center">
                <button onClick={() => setDeleteId(emp.id)} className="text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          )
        })}
      </DataTable>

      {/* Employee detail panel */}
      {selectedEmp && (() => {
        const eo = empOrders(selectedEmp)
        const es = shifts.filter(s => s.cashierName === selectedEmp.name)
        const total = empTotal(selectedEmp)
        return (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-indigo-200 dark:border-indigo-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="font-black text-lg text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                <User size={18} /> معاملات: {selectedEmp.name}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => handleExport(selectedEmp)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-indigo-700 transition-colors">
                  <Download size={13} /> PDF
                </button>
                <button onClick={() => setSelectedEmp(null)} className="p-2 bg-white dark:bg-slate-700 rounded-xl text-slate-500 hover:text-rose-500 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-700">
              <div className="text-center"><p className="text-2xl font-black text-indigo-600">{total.toFixed(2)} ج</p><p className="text-xs text-slate-500 font-bold">مبيعاته</p></div>
              <div className="text-center"><p className="text-2xl font-black text-emerald-600">{eo.length}</p><p className="text-xs text-slate-500 font-bold">طلبات</p></div>
              <div className="text-center"><p className="text-2xl font-black text-amber-600">{es.length}</p><p className="text-xs text-slate-500 font-bold">ورديات</p></div>
            </div>
            <div className="overflow-x-auto custom-scrollbar max-h-72">
              <table className="w-full text-right min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-500 font-bold text-xs">
                  <tr>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">الأصناف</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {[...eo].reverse().map(o => (
                    <tr key={o.id} className="border-b border-slate-100 dark:border-slate-700 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{o.date}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{(o.items || []).map(i => i.name).join('، ')}</td>
                      <td className="p-3"><Badge color="indigo">{o.note || 'تيك أواي'}</Badge></td>
                      <td className="p-3 text-center font-black text-indigo-600 dark:text-indigo-400">{o.total.toFixed(2)} ج</td>
                    </tr>
                  ))}
                  {!eo.length && (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-400 font-bold">لا توجد معاملات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {showModal && (
        <Modal title="إضافة موظف" onClose={() => setShowModal(false)} size="sm">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="الاسم الكامل" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم الموظف" />
            <Input label="الراتب الأساسي الشهري (ج)" required type="number" step="any" min="0"
              value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="0" />
            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ الموظف</Btn>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDelete
          onConfirm={() => { deleteEmployee(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
