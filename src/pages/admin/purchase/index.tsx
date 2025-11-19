import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, DatePicker, Button, Space, message, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Table from './table';
import {
  fetchPurchases,
  mapPaymentStatusFromEnum,
  getApiErrorMessage,
  PurchaseDto,
} from './PurcherseService';

const { RangePicker } = DatePicker;

interface PurchaseDisplay {
  id: string;
  supplier: string;
  buyer: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
}

const Purchase = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [purchases, setPurchases] = useState<PurchaseDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch purchases from API
  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await fetchPurchases();
      
      // Transform API data to display format
      const transformedPurchases: PurchaseDisplay[] = data.map((purchase: PurchaseDto) => ({
        id: purchase.id,
        supplier: purchase.supplier,
        buyer: purchase.buyer,
        gst: purchase.gst.toString(),
        amount: purchase.amount.toString(),
        quantity: purchase.quantity.toString(),
        payment: mapPaymentStatusFromEnum(purchase.paymentStatus),
        dueDate: purchase.dueDate,
      }));
      
      setPurchases(transformedPurchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      message.error(getApiErrorMessage(error, 'Failed to fetch purchases'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/purchase/form', { state: data });
    } else if (path === 'view') {
      navigate('/purchase/view', { state: data });
    }
  };

  // Filter purchases based on search text and date range
  const filteredPurchases = useMemo(() => {
    let filtered = [...purchases];

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
  }, [purchases, searchText, dateRange]);

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

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table onNavigate={handleNavigate} purchases={filteredPurchases} onDelete={loadPurchases} />
        )}
      </div>
    </div>
  );
};

export default Purchase;
