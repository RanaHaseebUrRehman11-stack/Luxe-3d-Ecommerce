import React, { useState } from 'react';
import { Product, ProductCategory, ProductVariant } from '../../types';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  X,
  Sparkles,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Layers,
  Box
} from 'lucide-react';

interface AdminProductsProps {
  products: Product[];
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function AdminProducts({ products, onShowToast }: AdminProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    category: ProductCategory;
    price: number;
    description: string;
    images: string[];
    newImageUrl: string;
    model3dUrl: string;
    variants: ProductVariant[];
    stock: number;
  }>({
    id: '',
    name: '',
    category: 'perfume',
    price: 0,
    description: '',
    images: [],
    newImageUrl: '',
    model3dUrl: '',
    variants: [{ name: 'Edition', value: '50ml Parfum' }],
    stock: 10
  });

  // Delete Confirmation Modal
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Open Form for Adding New Product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: `p-${Date.now()}`,
      name: '',
      category: 'perfume',
      price: 25000,
      description: '',
      images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'],
      newImageUrl: '',
      model3dUrl: '',
      variants: [{ name: 'Edition', value: '50ml Parfum' }],
      stock: 15
    });
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Product
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      price: prod.price,
      description: prod.description,
      images: prod.images && prod.images.length > 0 ? [...prod.images] : [],
      newImageUrl: '',
      model3dUrl: prod.model3dUrl || '',
      variants: prod.variants && prod.variants.length > 0 ? [...prod.variants] : [{ name: 'Edition', value: 'Standard' }],
      stock: prod.stock !== undefined ? prod.stock : 10
    });
    setIsFormOpen(true);
  };

  // Image Helper
  const handleAddImage = () => {
    if (!formData.newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, prev.newImageUrl.trim()],
      newImageUrl: ''
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Variant Helper
  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: 'Option', value: 'New Variant' }]
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index: number, field: 'name' | 'value', val: string) => {
    const updated = [...formData.variants];
    updated[index][field] = val;
    setFormData((prev) => ({ ...prev, variants: updated }));
  };

  // Save Product to Firestore
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      onShowToast('Product Name is required.', 'warning');
      return;
    }
    if (formData.price <= 0) {
      onShowToast('Please set a valid price.', 'warning');
      return;
    }
    if (formData.images.length === 0) {
      onShowToast('Please add at least one image URL.', 'warning');
      return;
    }

    setIsSaving(true);

    try {
      const prodId = editingProduct ? editingProduct.id : (formData.id || `p-${Date.now()}`);
      const productRef = doc(db, 'products', prodId);

      const productPayload: Product = {
        id: prodId,
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        description: formData.description.trim(),
        images: formData.images,
        model3dUrl: formData.model3dUrl.trim(),
        variants: formData.variants,
        stock: Number(formData.stock),
        createdAt: editingProduct?.createdAt || new Date().toISOString()
      };

      await setDoc(productRef, productPayload, { merge: true });

      onShowToast(
        editingProduct
          ? `✨ Updated product "${formData.name}" in Firestore!`
          : `✨ Added new product "${formData.name}" to live catalog!`,
        'success'
      );

      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving product to Firestore:', err);
      onShowToast('Failed to save product. Please check connection.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Product Action
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, 'products', deletingProduct.id));
      onShowToast(`Product "${deletingProduct.name}" permanently removed from catalog.`, 'info');
      setDeletingProduct(null);
    } catch (err) {
      console.error('Error deleting product from Firestore:', err);
      onShowToast('Failed to delete product. Please try again.', 'warning');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const formatPKR = (amt: number) => `PKR ${amt.toLocaleString()}`;

  return (
    <div>
      {/* Header Bar */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-gold)' }}>
              Catalog Manager
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: 0, color: '#ffffff' }}>
            Haute Products ({products.length})
          </h1>
        </div>

        <button onClick={handleOpenAddModal} className="btn-luxe" style={{ padding: '0.75rem 1.5rem', fontSize: '0.82rem' }}>
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-gold)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem'
        }}
      >
        {/* Search Field */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <input
            type="text"
            placeholder="Search by name, ID, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem'
            }}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'perfume', 'jewelry'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                border: categoryFilter === cat ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                backgroundColor: categoryFilter === cat ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: categoryFilter === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat === 'all' ? 'All Collections' : cat === 'perfume' ? 'Perfumes' : 'Fine Jewelry'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid var(--border-gold)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-gold)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.1em' }}>
                <th style={{ padding: '1rem' }}>Product</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Variants</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    No products matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    {/* Item thumbnail & details */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'}
                          alt={prod.name}
                          style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: '#111' }}
                        />
                        <div>
                          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: '#ffffff', fontWeight: 600 }}>
                            {prod.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prod.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          textTransform: 'uppercase',
                          fontSize: '0.72rem',
                          letterSpacing: '0.08em',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-subtle)',
                          color: prod.category === 'perfume' ? 'var(--accent-gold-light)' : '#c084fc',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '1rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      {formatPKR(prod.price)}
                    </td>

                    {/* Stock */}
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          color: prod.stock < 5 ? '#f87171' : prod.stock < 10 ? '#fbbf24' : '#4ade80',
                          fontWeight: 600
                        }}
                      >
                        {prod.stock} units
                      </span>
                    </td>

                    {/* Variants */}
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {prod.variants && prod.variants.length > 0
                        ? prod.variants.map((v) => v.value).join(', ')
                        : 'Standard'}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          title="Edit Product"
                          style={{
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px solid var(--border-gold)',
                            color: 'var(--accent-gold)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem'
                          }}
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeletingProduct(prod)}
                          title="Delete Product"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL FORM */}
      {isFormOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#0d0d0d',
              border: '1px solid var(--border-gold)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: 'var(--shadow-deep)',
              position: 'relative'
            }}
          >
            {/* Modal Close */}
            <button
              onClick={() => setIsFormOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#ffffff', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--accent-gold)" />
              <span>{editingProduct ? 'Edit Catalog Product' : 'Add New Haute Product'}</span>
            </h2>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Amber Oud Extract"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                  required
                />
              </div>

              {/* Category & Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="perfume">Perfumes & Fragrances</option>
                    <option value="jewelry">Fine Jewelry Solitaires</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Artisanal Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe notes, metal purity, craftsmanship..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Images URL Management */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Product Images (URLs) *
                </label>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.newImageUrl}
                    onChange={(e) => setFormData({ ...formData, newImageUrl: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="btn-luxe btn-outline"
                    style={{ padding: '0 1rem', fontSize: '0.8rem' }}
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails preview */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <img
                        src={img}
                        alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock & Optional 3D Model URL */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Vault Inventory Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    3D GLB Model URL (Optional Interactive Viewer)
                  </label>
                  <input
                    type="text"
                    placeholder="https://.../model.glb"
                    value={formData.model3dUrl}
                    onChange={(e) => setFormData({ ...formData, model3dUrl: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              {/* Dynamic Variants List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                    Product Editions / Variants
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    + Add Variant Option
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.variants.map((varItem, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Name (e.g. Edition)"
                        value={varItem.name}
                        onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                        style={{
                          width: '140px',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.82rem'
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 100ml Pure Extract / 18K Yellow Gold)"
                        value={varItem.value}
                        onChange={(e) => handleVariantChange(idx, 'value', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.82rem'
                        }}
                      />
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-luxe"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}
                >
                  <Check size={16} />
                  <span>{isSaving ? 'Saving Product...' : 'Save Product to Live Vault'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn-luxe btn-outline"
                  style={{ padding: '0.85rem 1.5rem' }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              maxWidth: '440px',
              width: '100%',
              backgroundColor: '#0d0d0d',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-deep)',
              animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              Confirm Catalog Deletion
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong style={{ color: '#ffffff' }}>"{deletingProduct.name}"</strong>? This action will immediately remove it from all live boutique listings.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.8rem',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>

              <button
                onClick={() => setDeletingProduct(null)}
                className="btn-luxe btn-outline"
                style={{ padding: '0.8rem 1.25rem', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
