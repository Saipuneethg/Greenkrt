import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

export default function ProductsManagement() {
  const { t } = useLanguage()
  const { products, addProduct, updateProduct, deleteProduct } = useData()

  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Fertilizers', price: '', stock: '' })
  const [editingProduct, setEditingProduct] = useState(null)

  const handleRemove = async (id) => {
    await deleteProduct(id)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    const stockNum = parseInt(editingProduct.stock) || 0
    await updateProduct(editingProduct.id, {
      ...editingProduct,
      stock: stockNum,
    })
    setEditingProduct(null)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    const stockNum = parseInt(newProduct.stock) || 0
    await addProduct({
      ...newProduct,
      price: parseInt(newProduct.price) || 0,
      stock: stockNum,
      unit: '50kg bag',
      brand: 'GreenKrt',
      badge: 'New',
      image: '🌿'
    })
    setShowAddModal(false)
    setNewProduct({ name: '', category: 'Fertilizers', price: '', stock: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#161d16]">{t('admin_products.title')}</h1>
        <button onClick={() => setShowAddModal(true)} className="h-[40px] px-4 bg-[#006e2f] text-white rounded font-semibold text-sm flex items-center gap-2 hover:bg-[#005a26] transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span> {t('admin_products.add_product')}
        </button>
      </div>

      <div className="bg-white border border-[#bccbb9] rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#bccbb9] bg-[#edf6ea] text-[#3d4a3d] font-bold">
              <th className="p-4">ID</th>
              <th className="p-4">{t('admin_products.name')}</th>
              <th className="p-4">{t('admin_products.category')}</th>
              <th className="p-4">{t('admin_products.price')}</th>
              <th className="p-4">{t('admin_products.stock')}</th>
              <th className="p-4">Status</th>
              <th className="p-4">{t('admin_products.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-[#bccbb9]/30 hover:bg-[#f3fcef]">
                <td className="p-4 text-[#3d4a3d]">{p.id}</td>
                <td className="p-4 font-semibold text-[#161d16]">{p.name}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4">{typeof p.price === 'number' ? `₹${p.price}` : p.price}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Low Stock' ? 'bg-[#ffdad6] text-[#93000a]' : p.status === 'Out of Stock' ? 'bg-red-100 text-red-800' : 'bg-[#cfe6c9] text-[#19722b]'}`}>{p.status}</span>
                </td>
                <td className="p-4 flex gap-3 items-center">
                  <button onClick={() => setEditingProduct(p)} className="text-[#006e2f] font-semibold text-xs hover:underline">Edit</button>
                  <button onClick={() => handleRemove(p.id)} className="text-red-600 font-semibold text-xs hover:underline">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Product Name</label>
                <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b] bg-white">
                  <option>Fertilizers</option>
                  <option>Pesticides</option>
                  <option>Seeds</option>
                  <option>Tools</option>
                  <option>Micronutrients</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Price (₹)</label>
                <input required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} type="number" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Stock Quantity</label>
                <input required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} type="number" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <button type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Add Product
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {editingProduct && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1c1c]">Edit Product Info</h2>
              <button onClick={() => setEditingProduct(null)} className="text-[#40493d] hover:text-[#1a1c1c]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Product Name</label>
                <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} type="text" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Price (ex: 320)</label>
                <input required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} type="number" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1c1c] mb-1">Stock Quantity</label>
                <input required value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} type="number" className="w-full h-10 px-3 border border-[#bfcaba] rounded focus:outline-none focus:border-[#0d631b]" />
              </div>
              <button type="submit" className="w-full h-12 bg-[#006e2f] hover:bg-[#005a26] text-white font-bold text-sm uppercase tracking-wider rounded transition-colors mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
