import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, Building, Package, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ViewData {
  id?: string;
  supplier: string;
  buyer: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
}

const View = () => {
  const navigate = useNavigate();
  
  // Sample data for demonstration
  const data: ViewData = {
    id: 'PO-2024-001',
    supplier: 'ABC Suppliers Ltd.',
    buyer: 'John Doe',
    gst: '18',
    amount: '50000',
    quantity: '250',
    payment: 'Partial',
    dueDate: '2024-12-31'
  };

  const totalWithGst = data.amount
    ? (parseFloat(data.amount) * (1 + parseFloat(data.gst) / 100)).toFixed(2)
    : '0.00';

  const getPaymentIcon = (payment: string) => {
    if (payment === 'Paid') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (payment === 'Pending') return <Clock className="w-5 h-5 text-orange-600" />;
    return <AlertCircle className="w-5 h-5 text-blue-600" />;
  };

  const getPaymentColor = (payment: string) => {
    if (payment === 'Paid') return 'text-green-600 bg-green-50 border-green-200';
    if (payment === 'Pending') return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/purchase')}
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
              <h1 className="text-2xl font-bold text-gray-900">Purchase Order</h1>
              <p className="text-sm text-gray-500 mt-1">{data.id}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Party Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Building className="w-4 h-4" />
                  <span>Supplier</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{data.supplier}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <User className="w-4 h-4" />
                  <span>Buyer</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{data.buyer}</p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Package className="w-4 h-4" />
                  <span>Quantity</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{data.quantity}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{data.dueDate}</p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-500 text-sm">Payment Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getPaymentColor(data.payment)}`}>
                  {getPaymentIcon(data.payment)}
                  <span className="font-semibold">{data.payment}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Amount</span>
                <span className="text-lg font-semibold text-gray-900">₹{parseFloat(data.amount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">GST ({data.gst}%)</span>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{(parseFloat(data.amount) * parseFloat(data.gst) / 100).toLocaleString()}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">₹{parseFloat(totalWithGst).toLocaleString()}</span>
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