import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import {  DatePicker, Space, message, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Table from './table';
import {
  fetchProducts,
  getApiErrorMessage,
  ProductDto,
} from './ProductService';

const { RangePicker } = DatePicker;

interface ProductDisplay {
  id: string;
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
  createdAt?: string;
}

const Product = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [products, setProducts] = useState<ProductDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch products from API
  const loadProducts = useCallback(async () => {
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
      
      const response = await fetchProducts(
        searchParam, 
        fromDateParam, 
        toDateParam,
        currentPage,
        pageSize
      );
      
      // Transform API data to display format
      const transformedProducts: ProductDisplay[] = response.data.map((item: ProductDto) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        categoryId: item.categoryId,
        categoryName: item.category?.name,
        brand: item.brand,
        unit: item.unit,
        costPrice: item.costPrice.toString(),
        sellingPrice: item.sellingPrice.toString(),
        stock: item.stock.toString(),
        gstPercentage: item.gstPercentage.toString(),
        expiryDate: item.expiryDate,
        hsnCode: item.hsnCode,
        barcode: item.barcode,
        imageUrl: item.imageUrl,
        createdAt: item.createdAt,
      }));
      
      setProducts(transformedProducts);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error(getApiErrorMessage(error, 'Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  }, [searchText, dateRange, currentPage, pageSize]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

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
      navigate('/product/form', { state: data });
    } else if (path === 'view') {
      navigate('/product/view', { state: data });
    }
  };

  // All filtering is handled by API (search and date range)
  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder="Search by product name, SKU, or brand"
                icon={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 600, height: '40px' }}
                // allowClear
                className="product-search-input"
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
                style={{ width: 200, height: '40px' }}
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
                Add Product
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
            products={filteredProducts} 
            onDelete={loadProducts}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} products`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Product;
