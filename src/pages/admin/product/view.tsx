import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface ViewData {
  id?: string;
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
  createdAt?: string | null;
  updatedAt?: string | null;
}

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as ViewData | null;

  useEffect(() => {
    if (!data) {
      navigate('/product');
    }
  }, [data, navigate]);

  if (!data) {
    return null;
  }

  const formatCurrency = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const profitMargin = parseFloat(data.sellingPrice) - parseFloat(data.costPrice);

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/product')}
          className="mb-6"
        >
          Back to Products List
        </Button>

        <Card
          title={<h2 className="text-2xl m-7 font-bold m-0" style={{ color: 'var(--text-primary)' }}>Product Details</h2>}
          headStyle={{ 
            backgroundColor: 'var(--surface-1)', 
            color: 'var(--text-primary)',
            padding: '16px 24px', 
            margin: '-24px -24px 24px -24px', 
            width: 'calc(100% + 48px)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid var(--glass-border)'
          }}
          className="shadow-card bg-surface-1"
          style={{ boxShadow: 'var(--card-shadow)', overflow: 'hidden', backgroundColor: 'var(--surface-1)', borderColor: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}
          bodyStyle={{ backgroundColor: 'var(--surface-1)' }}
        >
          {/* Product Image */}
          {data.imageUrl && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Product Image
              </h3>
              <img 
                src={data.imageUrl} 
                alt={data.name}
                style={{
                  maxWidth: '400px',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '1px solid var(--glass-border)'
                }}
              />
            </div>
          )}

          <Descriptions
            column={1}
            bordered
            labelStyle={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-primary)',
              width: '200px'
            }}
            contentStyle={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-primary)'
            }}
          >
            {/* <Descriptions.Item label="Product ID">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{data.id || '-'}</span>
            </Descriptions.Item> */}
            
            <Descriptions.Item label="Product Name">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{data.name || '-'}</span>
            </Descriptions.Item>
            
            <Descriptions.Item label="SKU">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {data.sku || '-'}
              </Tag>
            </Descriptions.Item>
            
            {data.categoryName && (
              <Descriptions.Item label="Category">
                {data.categoryName}
              </Descriptions.Item>
            )}
            
            {data.brand && (
              <Descriptions.Item label="Brand">
                {data.brand}
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Unit">
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {data.unit || '-'}
              </Tag>
            </Descriptions.Item>
            
            {data.hsnCode && (
              <Descriptions.Item label="HSN Code">
                {data.hsnCode}
              </Descriptions.Item>
            )}
            
            {data.barcode && (
              <Descriptions.Item label="Barcode">
                {data.barcode}
              </Descriptions.Item>
            )}
            
            {data.expiryDate && (
              <Descriptions.Item label="Expiry Date">
                {new Date(data.expiryDate).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Descriptions.Item>
            )}
            
            {data.createdAt && (
              <Descriptions.Item label="Created At">
                {new Date(data.createdAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
            
            {data.updatedAt && (
              <Descriptions.Item label="Last Updated">
                {new Date(data.updatedAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Product Summary */}
          <div className="mt-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Product Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Stock Available:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {data.stock} {data.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Cost Price:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  ₹ {formatCurrency(data.costPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Selling Price:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  ₹ {formatCurrency(data.sellingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">GST Percentage:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {data.gstPercentage}%
                </span>
              </div>
              <div className="border-t border-[var(--glass-border)] pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-[var(--text-primary)]">Profit Margin:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                    ₹ {formatCurrency(profitMargin)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Space className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate('/product/form', { state: { ...data, mode: 'edit' } })}
              style={{ 
                backgroundColor: 'var(--brand)', 
                borderColor: 'var(--brand)',
              }}
            >
              Edit Product
            </Button>
            <Button onClick={() => navigate('/product')}>
              Back to List
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default View;

