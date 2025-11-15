import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';

interface ViewData {
  id?: string;
  supplier: string;
  buyer: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
}

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as ViewData;

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-secondary p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/purchase')}
            className="mb-6"
          >
            Back to Purchase List
          </Button>
          <Card className="bg-surface-1 shadow-card">
            <p className="text-text-primary">No purchase data found. Please select a purchase to view.</p>
          </Card>
        </div>
      </div>
    );
  }

  const totalWithGst = data.amount
    ? (parseFloat(data.amount) * (1 + parseFloat(data.gst) / 100)).toFixed(2)
    : '0.00';

  const getPaymentTag = (payment: string) => {
    const colorMap: Record<string, string> = {
      Paid: 'success',
      Pending: 'warning',
      Partial: 'processing',
    };
    return <Tag color={colorMap[payment] || 'default'}>{payment}</Tag>;
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/purchase')}
          className="mb-6"
        >
          Back to Purchase List
        </Button>

        <Card
          title={
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text-primary m-0">Purchase Order Details</h2>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate('/purchase/form', { state: { ...data, mode: 'edit' } })}
                style={{
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Edit
              </Button>
            </div>
          }
          className="shadow-card bg-surface-1"
        >
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Supplier">
              <strong>{data.supplier}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Buyer">
              <strong>{data.buyer}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="GST">
              <strong>{data.gst}%</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <strong>₹{data.amount}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Total with GST">
              <strong className="text-accent-1">₹{totalWithGst}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              <strong>{data.quantity}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Status">
              {getPaymentTag(data.payment)}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              <strong>{data.dueDate}</strong>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default View;
