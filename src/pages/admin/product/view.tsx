import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Hash, DollarSign, Box, Tag, Calendar, Barcode, Image as ImageIcon } from 'lucide-react';

interface ViewData {
  id?: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName?: string;
  brand?: string | null;
  unit: string;
  costPrice: string;
  sellingPrice: string;
  stock: string;
  gstPercentage: string;
  expiryDate?: string | null;
  hsnCode?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
}

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const data: ViewData = location.state as ViewData || {
    id: 'PRD-2024-001',
    name: 'Sample Product',
    sku: 'SKU001',
    categoryId: '',
    unit: 'PCS',
    costPrice: '100',
    sellingPrice: '150',
    stock: '50',
    gstPercentage: '18',
  };

  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/product')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-[var(--surface-1)] rounded-lg shadow-sm border border-[var(--glass-border)]">
          {/* Title Bar */}
          <div className="flex justify-between items-center p-6 border-b border-[var(--glass-border)]">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Product Details</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{data.id || 'N/A'}</p>
            </div>
            <button 
              onClick={() => navigate('/product/form', { state: { ...data, mode: 'edit' } })} 
              className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Product Image */}
            {data.imageUrl && (
              <div className="mb-8">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Product Image</span>
                </div>
                <img 
                  src={data.imageUrl} 
                  alt={data.name}
                  className="w-full max-w-md h-auto rounded-lg border border-[var(--glass-border)]"
                />
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <Package className="w-4 h-4" />
                  <span>Product Name</span>
                </div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{data.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    <Hash className="w-4 h-4" />
                    <span>SKU</span>
                  </div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">{data.sku}</p>
                </div>

                {data.categoryName && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                      <Tag className="w-4 h-4" />
                      <span>Category</span>
                    </div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{data.categoryName}</p>
                  </div>
                )}

                {data.brand && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                      <Tag className="w-4 h-4" />
                      <span>Brand</span>
                    </div>
                    <p className="text-base font-semibold text-[var(--text-primary)]">{data.brand}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    <Box className="w-4 h-4" />
                    <span>Unit</span>
                  </div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">{data.unit}</p>
                </div>
              </div>

              {data.hsnCode && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    <Hash className="w-4 h-4" />
                    <span>HSN Code</span>
                  </div>
                  <p className="text-base text-[var(--text-primary)]">{data.hsnCode}</p>
                </div>
              )}

              {data.barcode && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    <Barcode className="w-4 h-4" />
                    <span>Barcode</span>
                  </div>
                  <p className="text-base text-[var(--text-primary)]">{data.barcode}</p>
                </div>
              )}

              {data.expiryDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Expiry Date</span>
                  </div>
                  <p className="text-base text-[var(--text-primary)]">{data.expiryDate}</p>
                </div>
              )}
            </div>

            {/* Pricing & Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <Box className="w-4 h-4" />
                  <span>Stock</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{data.stock} {data.unit}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Cost Price</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">₹{formatCurrency(data.costPrice)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Selling Price</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">₹{formatCurrency(data.sellingPrice)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <Tag className="w-4 h-4" />
                  <span>GST %</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{data.gstPercentage}%</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[var(--surface-2)] rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Summary</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Stock Available</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">{data.stock} {data.unit}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Cost Price</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">₹{formatCurrency(data.costPrice)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Selling Price</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">₹{formatCurrency(data.sellingPrice)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">GST Percentage</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">{data.gstPercentage}%</span>
              </div>

              <div className="border-t border-[var(--glass-border)] pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[var(--text-primary)]">Profit Margin</span>
                  <span className="text-2xl font-bold text-[var(--text-primary)]">
                    ₹{formatCurrency((parseFloat(data.sellingPrice) - parseFloat(data.costPrice)).toString())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View;

