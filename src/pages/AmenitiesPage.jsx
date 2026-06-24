import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Card, PrimaryButton, Input, FormField, Select } from '@/components/ui'

export default function AmenitiesPage() {
  const amenities = useStore((s) => s.amenities)
  const addAmenity = useStore((s) => s.addAmenity)
  const sellAmenity = useStore((s) => s.sellAmenity)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Supplement', price: '', stock: '', image: '' })

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
        {!isAdding && (
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
        {amenities.map(item => (
          <Card key={item.id} className="overflow-hidden group hover:border-primary transition-colors">
            <div className="aspect-square bg-surface-container-high flex items-center justify-center relative">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-text-muted">shopping_bag</span>
              )}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                {item.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-text-primary mb-1 truncate">{item.name}</h3>
              <div className="flex justify-between items-center text-xs mb-3">
                <span className="text-primary font-bold">Birr {item.price}</span>
                <span className="text-text-muted">{item.stock} in stock</span>
              </div>
              <PrimaryButton onClick={() => sellAmenity(item)} className="w-full text-xs py-1.5" disabled={item.stock <= 0}>
                {item.stock > 0 ? 'Sell Item' : 'Out of Stock'}
              </PrimaryButton>
            </div>
          </Card>
        ))}
        {amenities.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-text-muted bg-surface-container-low rounded-xl border border-dashed border-border-subtle">
            No items available. Click "Add Item" to start managing shop inventory.
          </div>
        )}
      </div>
    </div>
  )
}
