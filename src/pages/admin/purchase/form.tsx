import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Select, DatePicker, Button, Card, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { createPurchase, getApiErrorMessage, mapPaymentStatusToEnum, updatePurchase } from './PurcherseService';


const { Option } = Select;

interface PurchaseFormData {
  id?: string;
  supplier: string;
  buyer: string;
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
  const formData = location.state as PurchaseFormData | null;
  const isEditMode = formData?.mode === 'edit';

  useEffect(() => {
    if (formData && isEditMode) {
      form.setFieldsValue({
        supplier: formData.supplier,
        buyer: formData.buyer,
        gst: formData.gst,
        amount: parseFloat(formData.amount),
        quantity: parseFloat(formData.quantity),
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
        supplier: values.supplier,
        buyer: values.buyer,
        gst: values.gst,
        amount: values.amount,
        quantity: values.quantity,
        paymentStatus: paymentStatus,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : '',
      };

      if (isEditMode && formData?.id) {
        // Update existing purchase
        await updatePurchase(formData.id, apiData);
        message.success('Purchase updated successfully!');
      } else {
        // Create new purchase
        await createPurchase(apiData);
        message.success('Purchase created successfully!');
      }
      
      navigate('/purchase');
    } catch (error) {
      console.error('Error saving purchase:', error);
      message.error(getApiErrorMessage(error, 'Failed to save purchase'));
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
          onClick={() => navigate('/purchase')}
          className="mb-6"
        >
          Back to Purchase List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Purchase' : 'Add New Purchase'}</h2>}
          headStyle={{ 
            backgroundColor: 'var(--surface-1)', 
            color: 'var(--text-primary)',
            padding: '16px 24px', 
            margin: '-24px -24px 24px -24px', 
            width: 'calc(100% + 48px)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid var(--surface-2)'
          }}
          className="shadow-card bg-surface-1"
          style={{ boxShadow: 'var(--card-shadow)', overflow: 'hidden', backgroundColor: 'var(--surface-1)' }}
          bodyStyle={{ backgroundColor: 'var(--surface-1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Supplier"
              name="supplier"
              rules={[{ required: true, message: 'Please enter supplier name' }]}
            >
              <Input placeholder="Enter supplier name" size="large" />
            </Form.Item>

            <Form.Item
              label="Buyer"
              name="buyer"
              rules={[{ required: true, message: 'Please enter buyer name' }]}
            >
              <Input placeholder="Enter buyer name" size="large" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  type='number'
                  min={0}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) => {
                    const cleaned = value?.replace('%', '') || '';
                    const num = cleaned ? parseFloat(cleaned) : 0;
                    return num as any;
                  }}
                />
              </Form.Item>

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
                  type='number'
                  min={0}
                  prefix="₹"
                  formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => {
                    const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                    const num = cleaned ? parseFloat(cleaned) : 0;
                    return num as any;
                  }}
                />
              </Form.Item>
            </div>

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
                  type='number'
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

            <Form.Item
              label="Due Date"
              name="dueDate"
              rules={[{ required: true, message: 'Please select due date' }]}
            >
              <DatePicker
                style={{ width: '49%' }}
                size="large"
                format="YYYY-MM-DD"
                placeholder="Select due date"
              />
            </Form.Item>

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
                  {isEditMode ? 'Update Purchase' : 'Create Purchase'}
                </Button>
                <Button
                  onClick={() => navigate('/purchase')}
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
