import  { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { createPurchaseItem, getApiErrorMessage, updatePurchaseItem } from './PurchaseItemService';


interface PurchaseItemFormData {
  id?: string;
  item: string;
  description?: string;
  quantity: string;
  price: string;
  total: string;
  mode?: 'add' | 'edit';
}

const FormComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const formData = location.state as PurchaseItemFormData | null;
  const isEditMode = formData?.mode === 'edit' || (formData?.id && formData?.mode !== 'add');

  useEffect(() => {
    if (formData && isEditMode) {
      form.setFieldsValue({
        item: formData.item,
        description: formData.description,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        total: formData.total ? parseFloat(formData.total) : undefined,
      });
    }
  }, [formData, isEditMode, form]);

  // Calculate total when quantity or price changes
  const handleQuantityOrPriceChange = () => {
    const quantity = form.getFieldValue('quantity');
    const price = form.getFieldValue('price');
    if (quantity && price) {
      const total = quantity * price;
      form.setFieldsValue({ total: parseFloat(total.toFixed(2)) });
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Format data for API
      const apiData = {
        item: values.item,
        description: values.description || undefined,
        quantity: values.quantity,
        price: values.price,
        total: values.total || (values.quantity * values.price),
      };

      if (isEditMode && formData?.id) {
        // Update existing purchase item
        await updatePurchaseItem(formData.id, apiData);
        message.success('Purchase item updated successfully!');
      } else {
        // Create new purchase item
        await createPurchaseItem(apiData);
        message.success('Purchase item created successfully!');
      }
      
      navigate('/purchase-item');
    } catch (error) {
      console.error('Error saving purchase item:', error);
      message.error(getApiErrorMessage(error, 'Failed to save purchase item'));
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
          onClick={() => navigate('/purchase-item')}
          className="mb-6"
        >
          Back to Purchase Item List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Purchase Item' : 'Add New Purchase Item'}</h2>}
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
              label="Item"
              name="item"
              rules={[{ required: true, message: 'Please enter item name' }]}
            >
              <Input placeholder="Enter item name" size="large" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea 
                placeholder="Enter item description (optional)" 
                size="large"
                rows={3}
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onChange={handleQuantityOrPriceChange}
                />
              </Form.Item>

              <Form.Item
                label="Price"
                name="price"
                rules={[
                  { required: true, message: 'Please enter price' },
                  { type: 'number', min: 0, message: 'Price must be greater than 0' },
                ]}
              >
                <InputNumber
                  placeholder="Enter price"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  prefix="₹"
                  formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                  parser={(value) => {
                    const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                  onChange={handleQuantityOrPriceChange}
                />
              </Form.Item>

              <Form.Item
                label="Total"
                name="total"
                rules={[
                  { required: true, message: 'Total is required' },
                  { type: 'number', min: 0, message: 'Total must be greater than 0' },
                ]}
              >
                <InputNumber
                  placeholder="Total (auto-calculated)"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  prefix="₹"
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
                  {isEditMode ? 'Update Purchase Item' : 'Create Purchase Item'}
                </Button>
                <Button
                  onClick={() => navigate('/purchase-item')}
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

