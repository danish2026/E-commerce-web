import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message, Divider } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { createMultiplePurchaseItems } from './api';

interface PurchaseItemFormData {
  item: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
}

const BillingForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<PurchaseItemFormData[]>([
    { item: '', description: '', quantity: 0, price: 0, total: 0 }
  ]);

  // Calculate total for a specific item
  const calculateItemTotal = (index: number) => {
    const item = items[index];
    if (item.quantity && item.price) {
      const total = item.quantity * item.price;
      const updatedItems = [...items];
      updatedItems[index] = { ...item, total: parseFloat(total.toFixed(2)) };
      setItems(updatedItems);
      form.setFieldsValue({ items: updatedItems });
    }
  };

  // Handle quantity or price change for a specific item
  const handleItemChange = (index: number, field: keyof PurchaseItemFormData, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);

    if (field === 'quantity' || field === 'price') {
      calculateItemTotal(index);
    }
  };

  // Add a new item
  const handleAddItem = () => {
    setItems([...items, { item: '', description: '', quantity: 0, price: 0, total: 0 }]);
  };

  // Remove an item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      form.setFieldsValue({ items: updatedItems });
    } else {
      message.warning('At least one item is required');
    }
  };

  // Calculate grand total
  const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const onFinish = async () => {
    try {
      // Validate all items
      const validItems = items.filter(item => 
        item.item && item.quantity > 0 && item.price > 0
      );

      if (validItems.length === 0) {
        message.error('Please add at least one valid item');
        return;
      }

      if (validItems.length !== items.length) {
        message.error('Please fill in all required fields for all items');
        return;
      }

      setLoading(true);

      // Format data for API
      const apiData = validItems.map(item => ({
        item: item.item,
        description: item.description || undefined,
        quantity: item.quantity,
        price: item.price,
        total: item.total || (item.quantity * item.price),
      }));

      await createMultiplePurchaseItems(apiData);
      message.success('Purchase items created successfully!');
      navigate('/billing');
    } catch (error: any) {
      console.error('Error saving purchase items:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save purchase items';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/billing')}
          className="mb-6"
        >
          Back to Billing List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>Add Purchase Items</h2>}
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
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            {items.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Item {index + 1}
                  </h3>
                  {items.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(index)}
                      size="small"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Form.Item
                  label="Item Name"
                  required
                  validateStatus={!item.item ? 'error' : ''}
                  help={!item.item ? 'Item name is required' : ''}
                >
                  <Input
                    placeholder="Enter item name"
                    size="large"
                    value={item.item}
                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                  />
                </Form.Item>

                <Form.Item label="Description">
                  <Input.TextArea
                    placeholder="Enter item description (optional)"
                    size="large"
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Form.Item
                    label="Quantity"
                    required
                    validateStatus={!item.quantity || item.quantity <= 0 ? 'error' : ''}
                    help={!item.quantity || item.quantity <= 0 ? 'Quantity must be greater than 0' : ''}
                  >
                    <InputNumber
                      placeholder="Enter quantity"
                      style={{ width: '100%' }}
                      size="large"
                      min={1}
                      value={item.quantity}
                      onChange={(value) => handleItemChange(index, 'quantity', value || 0)}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Unit Price"
                    required
                    validateStatus={!item.price || item.price <= 0 ? 'error' : ''}
                    help={!item.price || item.price <= 0 ? 'Price must be greater than 0' : ''}
                  >
                    <InputNumber
                      placeholder="Enter unit price"
                      style={{ width: '100%' }}
                      size="large"
                      min={0}
                      formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={(value) => {
                        const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                        const num = cleaned ? parseFloat(cleaned) : undefined;
                        return num as any;
                      }}
                      value={item.price}
                      onChange={(value) => handleItemChange(index, 'price', value || 0)}
                    />
                  </Form.Item>

                  <Form.Item label="Total">
                    <InputNumber
                      placeholder="Auto-calculated"
                      style={{ width: '100%' }}
                      size="large"
                      min={0}
                      disabled
                      formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      value={item.total}
                    />
                  </Form.Item>
                </div>

                {index < items.length - 1 && <Divider className="my-6" />}
              </div>
            ))}

            <div className="mt-6 mb-4">
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
                block
                size="large"
                style={{ 
                  borderColor: 'var(--brand)',
                  color: 'var(--brand)',
                }}
              >
                Add More Items
              </Button>
            </div>

            <Divider className="my-6" />

            <div className="flex justify-end items-center mb-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--glass-border)]">
              <div className="text-right">
                <div className="text-sm text-[var(--text-secondary)] mb-1">Grand Total</div>
                <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
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
                >
                  Save All Items
                </Button>
                <Button
                  onClick={() => navigate('/billing')}
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
}

export default BillingForm;
