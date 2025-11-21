import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { createSales, getApiErrorMessage, mapPaymentStatusToEnum, updateSales } from './SalesService';


const { Option } = Select;

interface SalesFormData {
  id?: string;
  customer: string;
  seller: string;
  gst: string;
  amount: string;
  quantity: string;
  payment: string;
  dueDate: string;
  mode?: 'add' | 'edit';
}

const FormComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const formData = location.state as SalesFormData | null;
  const isEditMode = formData?.mode === 'edit' || (formData?.id && formData?.mode !== 'add');

  useEffect(() => {
    if (formData && isEditMode) {
      form.setFieldsValue({
        customer: formData.customer,
        seller: formData.seller,
        gst: formData.gst ? parseFloat(formData.gst) : undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        payment: formData.payment,
        dueDate: formData.dueDate ? dayjs(formData.dueDate) : null,
      });
    }
  }, [formData, isEditMode, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Map payment status to enum
      const paymentStatus = mapPaymentStatusToEnum(values.payment);
      
      // Format data for API
      const apiData = {
        customer: values.customer,
        seller: values.seller,
        gst: values.gst,
        amount: values.amount,
        quantity: values.quantity,
        paymentStatus: paymentStatus,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
      };

      if (isEditMode && formData?.id) {
        // Update existing sale
        await updateSales(formData.id, apiData);
        message.success('Sale updated successfully!');
      } else {
        // Create new sale
        await createSales(apiData);
        message.success('Sale created successfully!');
      }
      
      navigate('/sales');
    } catch (error) {
      console.error('Error saving sale:', error);
      message.error(getApiErrorMessage(error, 'Failed to save sale'));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error('Please fill in all required fields');
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/sales')}
          className="mb-6"
        >
          Back to Sales List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Sale' : 'Add New Sale'}</h2>}
          headStyle={{ 
            backgroundColor: 'var(--surface-1)', 
            color: 'var(--text-primary)',
            padding: '16px 24px', 
            margin: '-24px -24px 24px -24px', 
            width: 'calc(100% + 48px)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid var(--glass-border)'
          }}
          className="shadow-card bg-surface-1 sales-form-card"
          style={{ boxShadow: 'var(--card-shadow)', overflow: 'hidden', backgroundColor: 'var(--surface-1)', borderColor: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}
          bodyStyle={{ backgroundColor: 'var(--surface-1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="sales-form"
          >
            <Form.Item
              label="Customer"
              name="customer"
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input placeholder="Enter customer name" size="large" />
            </Form.Item>

            <Form.Item
              label="Seller"
              name="seller"
              rules={[{ required: true, message: 'Please enter seller name' }]}
            >
              <Input placeholder="Enter seller name" size="large" />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[
                  { required: true, message: 'Please enter quantity' },
                  { type: 'number', min: 1, message: 'Quantity must be at least 1' },
                ]}
              >
                <InputNumber
                  placeholder="Enter quantity"
                  style={{ width: '100%' }}
                  size="large"
                  min={1}
                />
              </Form.Item>

              <Form.Item
                label="Payment Status"
                name="payment"
                rules={[{ required: true, message: 'Please select payment status' }]}
              >
                <Select placeholder="Select payment status" size="large">
                  <Option value="Paid">Paid</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Partial">Partial</Option>
                </Select>
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Due Date"
              name="dueDate"
              rules={[{ required: true, message: 'Please select due date' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                format="YYYY-MM-DD"
                placeholder="Select due date"
              />
            </Form.Item>

            <Form.Item
                label="GST (%)"
                name="gst"
                rules={[
                  { required: true, message: 'Please enter GST percentage' },
                  { type: 'number', min: 0, max: 100, message: 'GST must be between 0 and 100' },
                ]}
              >
                <InputNumber
                  placeholder="Enter GST percentage"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  max={100}
                  formatter={(value) => value !== undefined && value !== null ? `${value}%` : ''}
                  parser={(value) => {
                    const cleaned = value?.replace('%', '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Amount"
                name="amount"
                rules={[
                  { required: true, message: 'Please enter amount' },
                  { type: 'number', min: 0, message: 'Amount must be greater than 0' },
                ]}
              >
                <InputNumber
                  placeholder="Enter amount"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value) => {
                    const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Totel Amount"
                name="amount"
                rules={[
                  { required: true, message: 'Please enter amount' },
                  { type: 'number', min: 0, message: 'Amount must be greater than 0' },
                ]}
              >
                <InputNumber
                  placeholder="Enter amount"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value) => {
                    const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                />
              </Form.Item>
            </div>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={loading}
                  style={{ 
                    backgroundColor: 'var(--brand)', 
                    borderColor: 'var(--brand)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand)';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--brand)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {isEditMode ? 'Update Sale' : 'Create Sale'}
                </Button>
                <Button
                  onClick={() => navigate('/sales')}
                  size="large"
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default FormComponent;

