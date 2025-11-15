import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, DatePicker, Button, Space } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Table from './table';

const { RangePicker } = DatePicker;

// Mock data - replace with actual API call
const mockPurchases = [
  {
    id: '1',
    supplier: 'ABC Suppliers',
    buyer: 'John Doe',
    gst: '18',
    amount: '50000',
    quantity: '100',
    payment: 'Paid',
    dueDate: '2024-01-15',
  },
  {
    id: '2',
    supplier: 'XYZ Corporation',
    buyer: 'Jane Smith',
    gst: '12',
    amount: '75000',
    quantity: '150',
    payment: 'Pending',
    dueDate: '2024-02-20',
  },
  {
    id: '3',
    supplier: 'Global Trading',
    buyer: 'Bob Johnson',
    gst: '18',
    amount: '30000',
    quantity: '75',
    payment: 'Partial',
    dueDate: '2024-01-30',
  },
];

const Purchase = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/purchase/form', { state: data });
    } else if (path === 'view') {
      navigate('/purchase/view', { state: data });
    }
  };

  // Filter purchases based on search text and date range
  const filteredPurchases = useMemo(() => {
    let filtered = [...mockPurchases];

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (purchase) =>
          purchase.supplier.toLowerCase().includes(searchLower) ||
          purchase.buyer.toLowerCase().includes(searchLower) ||
          purchase.amount.includes(searchText) ||
          purchase.quantity.includes(searchText)
      );
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((purchase) => {
        const purchaseDate = dayjs(purchase.dueDate);
        return purchaseDate.isAfter(dateRange[0]!.subtract(1, 'day')) && purchaseDate.isBefore(dateRange[1]!.add(1, 'day'));
      });
    }

    return filtered;
  }, [searchText, dateRange]);

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Purchase Management</h1>
        </div>

        <div className="bg-surface-1 rounded-lg shadow-card p-6 mb-6">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder="Search by supplier, buyer, amount, or quantity"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 550 ,height: '40px'}}
                allowClear
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
                style={{ width: 250 ,height: '40px'}}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleNavigate('form', { mode: 'add' })}
                size="large"
                style={{
                  height: '40px',
                  width: '200px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Add Purchase
              </Button>
            </Space>
          </Space>
        </div>

        <Table onNavigate={handleNavigate} purchases={filteredPurchases} />
      </div>
    </div>
  );
};

export default Purchase;
