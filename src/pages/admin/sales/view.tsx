import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, User, Building, Package, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ViewData {
  id?: string;
  customer: string;
  seller: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
}

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state or use sample data
  const locationData = location.state as ViewData | null;
  const data: ViewData = locationData || {
    id: 'SO-2024-001',
    customer: 'ABC Customer Ltd.',
    seller: 'John Doe',
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
    if (payment === 'Paid') return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    if (payment === 'Pending') return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
    return <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  };

  const getPaymentColor = (payment: string) => {
    if (payment === 'Paid') return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (payment === 'Pending') return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/sales')}
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Sales Order</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{data.id}</p>
            </div>
            <button onClick={() => navigate('/sales/form', { state: { ...data, mode: 'edit' } })} className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:opacity-90 transition-colors">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Party Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <Building className="w-4 h-4" />
                  <span>Customer</span>
                </div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{data.customer}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <User className="w-4 h-4" />
                  <span>Seller</span>
                </div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">{data.seller}</p>
              </div>
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <Package className="w-4 h-4" />
                  <span>Quantity</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{data.quantity}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Due Date</span>
                </div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{data.dueDate}</p>
              </div>

              <div className="space-y-2">
                <p className="text-[var(--text-secondary)] text-sm">Payment Status</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getPaymentColor(data.payment)}`}>
                  {getPaymentIcon(data.payment)}
                  <span className="font-semibold">{data.payment}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[var(--surface-2)] rounded-lg p-6 space-y-4 border border-[var(--glass-border)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Financial Summary</h3>
              
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Base Amount</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">₹{parseFloat(data.amount).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">GST ({data.gst}%)</span>
                <span className="text-lg font-semibold text-[var(--text-primary)]">
                  ₹{(parseFloat(data.amount) * parseFloat(data.gst) / 100).toLocaleString()}
                </span>
              </div>

              <div className="border-t border-[var(--glass-border)] pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-[var(--text-primary)]">Total Amount</span>
                  <span className="text-2xl font-bold text-[var(--text-primary)]">₹{parseFloat(totalWithGst).toLocaleString()}</span>
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



