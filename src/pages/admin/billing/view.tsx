import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PurchaseItem } from './api';

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const purchaseItem = location.state as PurchaseItem | null;

  useEffect(() => {
    if (!purchaseItem) {
      navigate('/billing');
    }
  }, [purchaseItem, navigate]);

  if (!purchaseItem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/billing')}
          className="mb-6"
        >
          Back to Billing List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Purchase Item Details</h2>}
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
            <Descriptions.Item label="Item Name">
              {purchaseItem.item}
            </Descriptions.Item>
            
            <Descriptions.Item label="Description">
              {purchaseItem.description || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No description</span>}
            </Descriptions.Item>
            
            <Descriptions.Item label="Quantity">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {purchaseItem.quantity}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Unit Price">
              <span style={{ fontSize: '16px' }}>
                ₹ {purchaseItem.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </Descriptions.Item>
            
            <Descriptions.Item label="Total Amount">
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--brand)' }}>
                ₹ {purchaseItem.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </Descriptions.Item>
            
            {purchaseItem.createdAt && (
              <Descriptions.Item label="Created At">
                {new Date(purchaseItem.createdAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
            
            {purchaseItem.updatedAt && (
              <Descriptions.Item label="Last Updated">
                {new Date(purchaseItem.updatedAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Space className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate('/billing/form', { state: { ...purchaseItem, mode: 'edit' } })}
              style={{ 
                backgroundColor: 'var(--brand)', 
                borderColor: 'var(--brand)',
              }}
            >
              Edit Item
            </Button>
            <Button onClick={() => navigate('/billing')}>
              Back to List
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
}

export default View;
