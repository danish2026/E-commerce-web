import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Space, message, Spin, Select, Alert } from 'antd';
import RangePicker from '../../../components/ui/RangePicker';
import { Input } from '../../../components/ui/Input';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Table from './table';
import LanguageSelector from '../../../components/purchase/LanguageSelector';
import { usePurchaseTranslation } from '../../../hooks/usePurchaseTranslation';
import {
  fetchPurchases,
  mapPaymentStatusFromEnum,
  getApiErrorMessage,
  PurchaseDto,
  PaymentStatus,
} from './PurcherseService';


interface PurchaseDisplay {
  id: string;
  supplier: string;
  buyer: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
  totalAmount: string;
}

const Purchase = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, translate } = usePurchaseTranslation();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>(undefined);
  const [purchases, setPurchases] = useState<PurchaseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch purchases from API
  const loadPurchases = useCallback(async () => {
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
      
      const response = await fetchPurchases(
        searchParam, 
        fromDateParam, 
        toDateParam,
        paymentStatus,
        currentPage,
        pageSize
      );
      
      // Transform API data to display format
      const transformedPurchases: PurchaseDisplay[] = response.data.map((purchase: PurchaseDto) => {
        // Calculate total amount: (amount * quantity) * (1 + gst / 100)
        const baseAmount = purchase.amount * purchase.quantity;
        const calculatedTotalAmount = baseAmount * (1 + purchase.gst / 100);
        
        return {
          id: purchase.id,
          supplier: purchase.supplier,
          buyer: purchase.buyer,
          gst: purchase.gst.toString(),
          amount: purchase.amount.toString(),
          quantity: purchase.quantity.toString(),
          payment: mapPaymentStatusFromEnum(purchase.paymentStatus),
          dueDate: purchase.dueDate,
          totalAmount: calculatedTotalAmount.toFixed(2),
        };
      });
      
      setPurchases(transformedPurchases);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      message.error(getApiErrorMessage(error, t.failedToFetch));
    } finally {
      setLoading(false);
    }
  }, [searchText, dateRange, paymentStatus, currentPage, pageSize, t]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
      // Auto-hide message after 3 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchText, dateRange, paymentStatus]);

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
      navigate('/purchase/form', { state: data });
    } else if (path === 'view') {
      navigate('/purchase/view', { state: data });
    }
  };

  const handleDeleteSuccess = () => {
    setSuccessMessage(t.purchaseDeleted);
    loadPurchases();
    // Auto-hide message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // All filtering is handled by API (search and date range)
  const filteredPurchases = purchases;

  return (
    <>
            {successMessage && (
          <div className="mb-6 flex justify-center">
            <Alert
              message={successMessage}
              type="success"
              showIcon
              closable
              onClose={() => setSuccessMessage(null)}
              style={{
                maxWidth: '600px',
                width: '100%',
              }}
            />
          </div>
        )}
    <div className="min-h-screen bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">

        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              {/* <LanguageSelector /> */}
              <Input
                placeholder={t.searchPlaceholder}
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 400, height: '40px' }}
                allowClear
                onPressEnter={() => {
                  setCurrentPage(1);
                  loadPurchases();
                }}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={[t.startDate, t.endDate]}
                style={{ width: 200 ,height: '40px'}}
              />
              <Select
                placeholder={t.paymentStatus}
                value={paymentStatus}
                onChange={(value) => setPaymentStatus(value || undefined)}
                allowClear
                style={{ width: 150, height: '40px' }}
                options={[
                  { label: t.paid, value: PaymentStatus.PAID },
                  { label: t.pending, value: PaymentStatus.PENDING },
                  { label: t.partial, value: PaymentStatus.PARTIAL },
                  { label: t.overdue, value: PaymentStatus.OVERDUE },
                ]}
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
                {t.addPurchase}
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
            purchases={filteredPurchases} 
            onDelete={handleDeleteSuccess}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total) => translate('totalPurchases', { count: total }),
            }}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default Purchase;
