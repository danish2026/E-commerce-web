import { Button, DatePicker, Input, Space, Spin } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { fetchPurchaseItems, PurchaseItem } from './api';
import Table from './table';

const Billing = () => {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load purchase items
  const loadPurchaseItems = async () => {
    try {
      setLoading(true);
      const data = await fetchPurchaseItems();
      setPurchaseItems(data);
    } catch (error: any) {
      console.error('Error loading purchase items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseItems();
  }, []);

  // Filter purchase items based on search and date range
  const filteredPurchaseItems = useMemo(() => {
    let filtered = [...purchaseItems];

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.item?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.quantity?.toString().includes(searchLower) ||
        item.price?.toString().includes(searchLower) ||
        item.total?.toString().includes(searchLower)
      );
    }

    // Date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0];
      const endDate = dateRange[1];
      filtered = filtered.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = dayjs(item.createdAt);
        return itemDate.isAfter(startDate.subtract(1, 'day')) && 
               itemDate.isBefore(endDate.add(1, 'day'));
      });
    }

    return filtered;
  }, [purchaseItems, searchText, dateRange]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredPurchaseItems.slice(start, end);
  }, [filteredPurchaseItems, currentPage, pageSize]);

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/billing/form', { state: data });
    } else if (path === 'view') {
      navigate('/billing/view', { state: data });
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen gap-[30px] bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder="Search by item, description, quantity, or amount"
                style={{ width: 600, height: '40px' }}
                allowClear
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
                  setCurrentPage(1); // Reset to first page on date change
                }}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
                style={{ width: 200, height: '40px' }}
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
          <Table
            data={paginatedItems}
            loading={loading}
            onNavigate={handleNavigate}
            onDelete={loadPurchaseItems}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredPurchaseItems.length,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total: number) => `Total ${total} purchase items`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Billing;
