import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space, Table } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Order, PaymentType } from './api';
import type { ColumnsType } from 'antd/es/table';

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state as Order | null;

  useEffect(() => {
    if (!order) {
      navigate('/billing');
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  const getPaymentTypeColor = (paymentType: PaymentType) => {
    switch (paymentType) {
      case PaymentType.CASH:
        return 'green';
      case PaymentType.CARD:
        return 'blue';
      case PaymentType.UPI:
        return 'purple';
      case PaymentType.CREDIT:
        return 'orange';
      default:
        return 'default';
    }
  };

  const orderItemsColumns: ColumnsType<any> = [
    {
      title: 'Product',
      key: 'product',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {record.product?.name || 'N/A'}
          </div>
          {record.product?.sku && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              SKU: {record.product.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (quantity: number | string) => (
        <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
          {Number(quantity) || 0}
        </Tag>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (unitPrice: number | string) => (
        <span style={{ color: 'var(--text-primary)' }}>
          ₹ {(Number(unitPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'GST %',
      dataIndex: 'gstPercentage',
      key: 'gstPercentage',
      align: 'center',
      render: (gstPercentage: number | string) => (
        <span style={{ color: 'var(--text-primary)' }}>
          {Number(gstPercentage) || 0}%
        </span>
      ),
    },
    {
      title: 'GST Amount',
      dataIndex: 'gstAmount',
      key: 'gstAmount',
      align: 'right',
      render: (gstAmount: number | string) => (
        <span style={{ color: 'var(--text-primary)' }}>
          ₹ {(Number(gstAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right',
      render: (totalPrice: number | string) => (
        <span style={{ fontWeight: 'bold', color: 'var(--brand)' }}>
          ₹ {(Number(totalPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/billing')}
          className="mb-6"
        >
          Back to Orders List
        </Button>

        <Card
          title={<h2 className="text-2xl m-7 font-bold m-0" style={{ color: 'var(--text-primary)' }}>Order Details</h2>}
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
            <Descriptions.Item label="Order Number">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{order.orderNumber || '-'}</span>
            </Descriptions.Item>
            
            <Descriptions.Item label="Customer Name">
              {order.customerName || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Walk-in Customer</span>}
            </Descriptions.Item>
            
            {order.customerPhone && (
              <Descriptions.Item label="Customer Phone">
                {order.customerPhone}
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Payment Type">
              <Tag color={getPaymentTypeColor(order.paymentType)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {order.paymentType}
              </Tag>
            </Descriptions.Item>
            
            {order.createdAt && (
              <Descriptions.Item label="Created At">
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
            
            {order.updatedAt && (
              <Descriptions.Item label="Last Updated">
                {new Date(order.updatedAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Order Items Table */}
          {order.orderItems && order.orderItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Order Items
              </h3>
              <Table
                columns={orderItemsColumns}
                dataSource={order.orderItems}
                rowKey="id"
                pagination={false}
                className="bg-surface-1"
                style={{ backgroundColor: 'var(--surface-1)' }}
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Order Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Subtotal:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  ₹ {(Number(order.subtotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">GST Total:</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  ₹ {(Number(order.gstTotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Discount:</span>
                  <span className="text-sm font-semibold text-red-500">
                    - ₹ {(Number(order.discount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="border-t border-[var(--glass-border)] pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-[var(--text-primary)]">Grand Total:</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                    ₹ {(Number(order.grandTotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Space className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate('/billing/form', { state: { ...order, mode: 'edit' } })}
              style={{ 
                backgroundColor: 'var(--brand)', 
                borderColor: 'var(--brand)',
              }}
            >
              Edit Order
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
