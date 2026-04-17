import { useState } from 'react'
import { Package, Plus, Trash2, Bell } from 'lucide-react'
import { useStore, selectLowStock } from '../store'
import { Modal, ConfirmDelete, PageHeader, DataTable, Badge, Input, Select, Btn, AlertBanner } from '../components/UI'

const UNITS = ['جرام', 'مللي', 'قطعة', 'كيلو', 'لتر']

export default function InventoryPage() {
  const { rawMaterials, upsertMaterial, deleteMaterial } = useStore()
  const lowStock = useStore(selectLowStock(50))

  const [showModal,  setShowModal]  = useState(false)
  const [deleteId,   setDeleteId]   = useState(null)
  const [form,       setForm]       = useState({ name: '', unit: 'جرام', currentStock: '', costPerUnit: '' })

  const handleSave = (e) => {
    e.preventDefault()
    upsertMaterial({ ...form, currentStock: parseFloat(form.currentStock), costPerUnit: parseFloat(form.costPerUnit) })
    setShowModal(false)
    setForm({ name: '', unit: 'جرام', currentStock: '', costPerUnit: '' })
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<Package size={28} />}
        title="المواد الخام"
        action={
          <Btn onClick={() => setShowModal(true)}>
            <Plus size={17} /> مادة جديدة
          </Btn>
        }
      />

      {lowStock.length > 0 && (
        <AlertBanner
          icon={<Bell className="w-5 h-5 text-rose-500" />}
          title={`⚠️ ${lowStock.length} مادة وصلت للحد الأدنى من المخزون`}
          items={lowStock.map(m => `${m.name} (${m.currentStock} ${m.unit})`)}
          color="rose"
        />
      )}

      <DataTable
        headers={[
          { label: 'المادة' }, { label: 'الوحدة' }, { label: 'الكمية الحالية' },
          { label: 'تكلفة الوحدة' }, { label: 'إجمالي قيمة المخزون' }, { label: 'حذف', center: true }
        ]}
        empty={!rawMaterials.length ? 'لا توجد مواد خام مسجلة' : null}
      >
        {rawMaterials.map(m => {
          const isLow  = m.currentStock <= 50
          const isZero = m.currentStock <= 0
          return (
            <tr key={m.id} className={`border-b border-slate-100 dark:border-slate-700 text-sm ${isLow ? 'bg-rose-50/40 dark:bg-rose-900/10' : ''}`}>
              <td className="p-4 font-black text-slate-800 dark:text-white flex items-center gap-2">
                {isLow && <Bell size={14} className="text-rose-500 shrink-0" />}
                {m.name}
              </td>
              <td className="p-4 text-slate-500 dark:text-slate-400">{m.unit}</td>
              <td className="p-4">
                <Badge color={isZero ? 'rose' : isLow ? 'rose' : m.currentStock < 200 ? 'amber' : 'emerald'}>
                  {m.currentStock}
                </Badge>
              </td>
              <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{m.costPerUnit} ج</td>
              <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{(m.currentStock * m.costPerUnit).toFixed(2)} ج</td>
              <td className="p-4 text-center">
                <button onClick={() => setDeleteId(m.id)} className="text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          )
        })}
      </DataTable>

      {/* Add modal */}
      {showModal && (
        <Modal title="إضافة مادة خام" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم المادة" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: حليب، قهوة..." />
            <Select label="وحدة القياس" required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="الكمية الافتتاحية" required type="number" step="any" min="0" value={form.currentStock}
                onChange={e => setForm({ ...form, currentStock: e.target.value })} placeholder="0" />
              <Input label="تكلفة الوحدة (ج)" required type="number" step="any" min="0" value={form.costPerUnit}
                onChange={e => setForm({ ...form, costPerUnit: e.target.value })} placeholder="0.00" />
            </div>
            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ المادة</Btn>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <ConfirmDelete
          onConfirm={() => { deleteMaterial(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
