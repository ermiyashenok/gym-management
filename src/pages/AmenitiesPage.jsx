import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Card, PrimaryButton, Input, FormField, Select } from '@/components/ui'

export default function AmenitiesPage() {
  const amenities = useStore((s) => s.amenities)
  const payments = useStore((s) => s.payments)
  const currentBranch = useStore((s) => s.currentBranch)
  const addAmenity = useStore((s) => s.addAmenity)
  const sellAmenity = useStore((s) => s.sellAmenity)
  const deleteAmenity = useStore((s) => s.deleteAmenity)
  const currentUser = useStore((s) => s.currentUser)
  const isOwner = currentUser?.role === 'Owner'
  const [isAdding, setIsAdding] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'Supplement', price: '', stock: '', image: '' })

  const amenitySales = payments.filter(p => p.member_id === 'Amenity_Sale')
  const filteredAmenities = amenities.filter(a => currentBranch === 'all' || a.branch_id === currentBranch)

  const handleSubmit = (e) => {
    e.preventDefault()
    addAmenity(form)
    setForm({ name: '', category: 'Supplement', price: '', stock: '', image: '' })
    setIsAdding(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setForm({ ...form, image: reader.result })
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-text-primary">Shop & Amenities</h1>
          <p className="text-text-muted text-xs mt-1">Manage gym products, supplements, and merchandise.</p>
        </div>
        {!isAdding && !isOwner && (
          <PrimaryButton onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span> Add Item
          </PrimaryButton>
        )}
      </div>

      {isAdding && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-headline text-lg font-bold mb-4">Add New Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Item Name *">
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FormField>
              <FormField label="Category *">
                <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="Supplement">Supplement</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>
              <FormField label="Price (Birr) *">
                <Input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </FormField>
              <FormField label="Initial Stock *">
                <Input type="number" required min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </FormField>
              <FormField label="Product Image">
                <Input type="file" accept="image/*" onChange={handleImageChange} className="text-xs" />
              </FormField>
            </div>
            {form.image && (
              <div className="mt-4 w-24 h-24 rounded overflow-hidden border border-border-subtle">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">Cancel</button>
              <PrimaryButton type="submit">Save Item</PrimaryButton>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAmenities.map(item => {
          const soldCount = amenitySales.filter(p => p.plan_label === `Sold ${item.name}`).length
          return (
          <Card key={item.id} className="flex flex-col overflow-hidden group hover:border-primary transition-colors">
            <div className="aspect-square bg-surface-container-high flex items-center justify-center relative">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-text-muted">shopping_bag</span>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  {item.category}
                </div>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-text-primary mb-1 truncate">{item.name}</h3>
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-primary font-bold">Birr {item.price}</span>
                <span className="text-text-muted">{item.stock} in stock</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-text-muted mb-4 pt-2 border-t border-border-subtle">
                <span>Sold: <span className="font-bold text-text-primary">{soldCount}</span></span>
                <span>Revenue: Birr {(soldCount * item.price).toLocaleString()}</span>
              </div>
              <div className="mt-auto flex gap-2">
                {!isOwner && (
                  <>
                    <PrimaryButton onClick={() => sellAmenity(item)} className="flex-1 text-xs py-1.5" disabled={item.stock <= 0}>
                      {item.stock > 0 ? 'Sell Item' : 'Out of Stock'}
                    </PrimaryButton>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                      className="px-3 py-1.5 bg-danger-red/10 border border-danger-red/20 text-danger-red text-xs font-bold rounded-lg hover:bg-danger-red/20 transition-all flex items-center justify-center"
                      title="Delete Item"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )})}
        {filteredAmenities.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-text-muted bg-surface-container-low rounded-xl border border-dashed border-border-subtle">
            No items available. Click "Add Item" to start managing shop inventory.
          </div>
        )}
      </div>

      {itemToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border-subtle p-6 rounded-xl w-full max-w-xs shadow-2xl relative text-center">
            <span className="material-symbols-outlined text-danger-red text-4xl mb-3">delete</span>
            <h2 className="font-headline text-lg font-bold mb-2">Delete Item?</h2>
            <p className="text-sm text-text-muted mb-6">Are you sure you want to remove "{itemToDelete.name}"?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-border-subtle rounded-lg">Cancel</button>
              <button onClick={() => { deleteAmenity(itemToDelete.id); setItemToDelete(null); }} className="px-4 py-2 text-sm bg-danger-red text-white font-bold rounded-lg hover:bg-danger-red/90 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
