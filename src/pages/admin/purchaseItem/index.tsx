import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {  Space, message, Spin } from 'antd';
import RangePicker from '../../../components/ui/RangePicker';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Table from './table';
import LanguageSelector from '../../../components/purchase/LanguageSelector';
import { usePurchaseTranslation } from '../../../hooks/usePurchaseTranslation';
import {
  fetchPurchaseItems,
  getApiErrorMessage,
  PurchaseItemDto,
} from './PurchaseItemService';


interface PurchaseItemDisplay {
  id: string;
  item: string;
  description?: string;
  quantity: string;
  price: string;
  total: string;
  supplier?: string | null;
  buyer?: string | null;
  createdAt?: string;
}

const PurchaseItem = () => {
  const navigate = useNavigate();
  const { t, translate } = usePurchaseTranslation();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch purchase items from API
  const loadPurchaseItems = useCallback(async () => {
    try {
      setLoading(true);
      const searchParam = searchText.trim() || undefined;
      
      // Format dates as YYYY-MM-DD for API
      const fromDateParam = dateRange && dateRange[0] 
        ? dateRange[0].format('YYYY-MM-DD') 
        : undefined;
      const toDateParam = dateRange && dateRange[1] 
        ? dateRange[1].format('YYYY-MM-DD') 
        : undefined;
      
      const response = await fetchPurchaseItems(
        searchParam, 
        fromDateParam, 
        toDateParam,
        currentPage,
        pageSize
      );
      
      // Transform API data to display format
      const transformedPurchaseItems: PurchaseItemDisplay[] = response.data.map((item: PurchaseItemDto) => ({
        id: item.id,
        item: item.item,
        description: item.description,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        total: item.total.toString(),
        supplier: item.supplier || null,
        buyer: item.buyer || null,
        createdAt: item.createdAt,
      }));
      
      setPurchaseItems(transformedPurchaseItems);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching purchase items:', error);
      message.error(getApiErrorMessage(error, t.failedToFetchPurchaseItems));
    } finally {
      setLoading(false);
    }
  }, [searchText, dateRange, currentPage, pageSize, t]);

  useEffect(() => {
    loadPurchaseItems();
  }, [loadPurchaseItems]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchText, dateRange]);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setCurrentPage(current);
    setPageSize(size);
  };

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/purchase-item/form', { state: data });
    } else if (path === 'view') {
      navigate('/purchase-item/view', { state: data });
    }
  };

  // All filtering is handled by API (search and date range)
  const filteredPurchaseItems = purchaseItems;

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              {/* <LanguageSelector /> */}
              <Input
                placeholder={t.searchPurchaseItemPlaceholder}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 500, height: '40px' }}
                allowClear
                onPressEnter={() => {
                  setCurrentPage(1);
                  loadPurchaseItems();
                }}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={[t.startDate, t.endDate]}
                style={{ width: 300, height: '40px' }}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleNavigate('form', { mode: 'add' })}
                style={{
                  height: '40px',
                  width: '200px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.addPurchaseItem}
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
            onNavigate={handleNavigate} 
            purchaseItems={filteredPurchaseItems} 
            onDelete={loadPurchaseItems}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total) => translate('totalPurchaseItems', { count: total }),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseItem;
