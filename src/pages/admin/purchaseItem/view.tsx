import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Package, FileText, Hash, DollarSign } from 'lucide-react';

interface ViewData {
  id?: string;
  item: string;
  description?: string;
  quantity: string;
  price: string;
  total: string;
}

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const data: ViewData = location.state as ViewData || {
    id: 'PI-2024-001',
    item: 'Sample Item',
    description: 'Sample description',
    quantity: '10',
    price: '5000',
    total: '50000'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/purchase-item')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Title Bar */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Item Details</h1>
              <p className="text-sm text-gray-500 mt-1">{data.id || 'N/A'}</p>
            </div>
            <button 
              onClick={() => navigate('/purchase-item/form', { state: { ...data, mode: 'edit' } })} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Item Details */}
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Package className="w-4 h-4" />
                  <span>Item Name</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{data.item}</p>
              </div>

              {data.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Description</span>
                  </div>
                  <p className="text-base text-gray-700">{data.description}</p>
                </div>
              )}
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Hash className="w-4 h-4" />
                  <span>Quantity</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{data.quantity}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Price per Unit</span>
                </div>
                <p className="text-xl font-bold text-gray-900">₹{parseFloat(data.price).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Total Amount</span>
                </div>
                <p className="text-xl font-bold text-gray-900">₹{parseFloat(data.total).toLocaleString()}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity</span>
                <span className="text-lg font-semibold text-gray-900">{data.quantity} units</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per Unit</span>
                <span className="text-lg font-semibold text-gray-900">₹{parseFloat(data.price).toLocaleString()}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">₹{parseFloat(data.total).toLocaleString()}</span>
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

