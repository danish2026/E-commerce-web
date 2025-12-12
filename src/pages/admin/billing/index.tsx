import { Space, Spin } from 'antd';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import RangePicker from '../../../components/ui/RangePicker';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
// import LanguageSelector from '../../../components/purchase/LanguageSelector';
import { useBillingTranslation } from '../../../hooks/useBillingTranslation';
import { usePermissions } from '../../../hooks/usePermissions';
import { fetchOrders, Order } from './api';
import Table from './table';


const Billing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, translate } = useBillingTranslation();
  const { canCreate, canView, canEdit, canDelete } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [minSubtotal, setMinSubtotal] = useState<number | null>(null);
  const [maxSubtotal, setMaxSubtotal] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Permission checks for billing module
  const moduleName = 'billing';
  const canCreateOrder = canCreate(moduleName);
  const canViewOrder = canView(moduleName);
  const canEditOrder = canEdit(moduleName);
  const canDeleteOrder = canDelete(moduleName);

  // Load orders with server-side pagination and filtering
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const searchParam = searchText.trim() || undefined;
      const fromDate = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
      const toDate = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;
      
      const response = await fetchOrders(
        currentPage,
        pageSize,
        searchParam,
        fromDate,
        toDate,
        undefined,
        minSubtotal || undefined,
        maxSubtotal || undefined
      );
      
      setOrders(response.data);
      setTotal(response.meta.total);
    } catch (error: any) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateRange, maxSubtotal, minSubtotal, pageSize, searchText]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setCurrentPage(current);
    setPageSize(size);
  };

  const handleDeleteSuccess = () => {
    loadOrders();
    // Success message will be handled by MainLayout via navigation state
    navigate(location.pathname, { state: { successMessage: t.orderDeleted } });
  };

  return (
    <div className="min-h-screen gap-[30px] bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder={t.searchPlaceholder}
                style={{ width: 550, height: '40px' }}
                allowClear
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                onPressEnter={() => {
                  setCurrentPage(1);
                  loadOrders();
                }}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
                  setCurrentPage(1);
                }}
                format="YYYY-MM-DD"
                placeholder={[t.startDate, t.endDate]}
                style={{ width: 250, height: '40px' }}
              />
              {/* <InputNumber
                placeholder="Min Subtotal"
                style={{ width: 140, height: '40px' }}
                min={0}
                precision={2}
                value={minSubtotal}
                onChange={(value) => {
                  setMinSubtotal(value);
                  setCurrentPage(1);
                }}
                formatter={(value) => value ? `₹ ${value}` : ''}
                parser={(value) => {
                  if (!value) return 0;
                  const parsed = parseFloat(value.replace(/₹\s?|(,*)/g, ''));
                  return isNaN(parsed) ? 0 : parsed;
                }}
              /> */}
              {/* <InputNumber
                placeholder="Max Subtotal"
                style={{ width: 140, height: '40px' }}
                min={0}
                precision={2}
                value={maxSubtotal}
                onChange={(value) => {
                  setMaxSubtotal(value);
                  setCurrentPage(1);
                }}
                formatter={(value) => value ? `₹ ${value}` : ''}
                parser={(value) => {
                  if (!value) return 0;
                  const parsed = parseFloat(value.replace(/₹\s?|(,*)/g, ''));
                  return isNaN(parsed) ? 0 : parsed;
                }}
              /> */}
              <Button
                icon={<PlusOutlined />}
                onClick={() => navigate('/billing/form')}
                disabled={!canCreateOrder}
                title={!canCreateOrder ? 'You do not have permission to create orders' : ''}
                style={{
                  height: '40px',
                  width: '200px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.createOrder}
              </Button>
            </Space>
          </Space>
        </div>

        {!canViewOrder ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center text-[var(--text-secondary)]">
              You do not have permission to view orders.
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            data={orders}
            loading={loading}
            onNavigate={handleNavigate}
            onDelete={handleDeleteSuccess}
            canEdit={canEditOrder}
            canDelete={canDeleteOrder}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total: number) => translate('totalOrders', { count: total }),
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Billing;
