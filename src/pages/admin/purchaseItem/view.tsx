import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usePurchaseTranslation } from '../../../hooks/usePurchaseTranslation';

interface ViewData {
  id?: string;
  item: string;
  description?: string;
  quantity: string;
  price: string;
  total: string;
  supplier?: string | null;
  buyer?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = usePurchaseTranslation();
  const data = location.state as ViewData | null;

  useEffect(() => {
    if (!data) {
      navigate('/purchase-item');
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

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/purchase-item')}
          className="mb-6"
        >
          {t.backToPurchaseItemsList}
        </Button>

        <Card
          title={<h2 className="text-2xl m-7 font-bold m-0" style={{ color: 'var(--text-primary)' }}>{t.purchaseItemDetails}</h2>}
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
            {/* <Descriptions.Item label="Purchase Item ID">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{data.id || '-'}</span>
            </Descriptions.Item> */}
            
            <Descriptions.Item label={t.itemName}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{data.item || '-'}</span>
            </Descriptions.Item>
            
            {data.description && (
              <Descriptions.Item label={t.description}>
                {data.description}
              </Descriptions.Item>
            )}
            
            {data.supplier && (
              <Descriptions.Item label={t.supplier}>
                <span style={{ color: 'var(--text-primary)' }}>{data.supplier}</span>
              </Descriptions.Item>
            )}
            
            {data.buyer && (
              <Descriptions.Item label={t.buyer}>
                <span style={{ color: 'var(--text-primary)' }}>{data.buyer}</span>
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label={t.quantity}>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {data.quantity || '0'} {t.units}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label={t.pricePerUnit}>
              <span style={{ color: 'var(--text-primary)' }}>
                ₹ {formatCurrency(data.price)}
              </span>
            </Descriptions.Item>
            
            {data.createdAt && (
              <Descriptions.Item label={t.createdAt}>
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
              <Descriptions.Item label={t.lastUpdated}>
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

          {/* Purchase Item Summary */}
          <div className="mt-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {t.purchaseItemSummary}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">{t.quantity}:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {data.quantity} {t.units}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">{t.pricePerUnit}:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  ₹ {formatCurrency(data.price)}
                </span>
              </div>
              <div className="border-t border-[var(--glass-border)] pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-[var(--text-primary)]">{t.totalAmountWithGst}:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                    ₹ {formatCurrency(data.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Space className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate('/purchase-item/form', { state: { ...data, mode: 'edit' } })}
              style={{ 
                backgroundColor: 'var(--brand)', 
                borderColor: 'var(--brand)',
              }}
            >
              {t.editPurchaseItemButton}
            </Button>
            <Button onClick={() => navigate('/purchase-item')}>
              {t.backToList}
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default View;

