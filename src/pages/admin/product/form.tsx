import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message, Select, DatePicker } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { createProduct, getApiErrorMessage, updateProduct, fetchCategories, CategoryDto } from './ProductService';

const { Option } = Select;

interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  categoryId: string;
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
  mode?: 'add' | 'edit';
}

const FormComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const formData = location.state as ProductFormData | null;
  const isEditMode = formData?.mode === 'edit' || (formData?.id && formData?.mode !== 'add');

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error(getApiErrorMessage(error, 'Failed to load categories'));
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (formData && isEditMode) {
      form.setFieldsValue({
        name: formData.name,
        sku: formData.sku,
        categoryId: formData.categoryId,
        brand: formData.brand,
        unit: formData.unit,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : undefined,
        stock: formData.stock ? parseFloat(formData.stock) : undefined,
        gstPercentage: formData.gstPercentage ? parseFloat(formData.gstPercentage) : undefined,
        expiryDate: formData.expiryDate ? dayjs(formData.expiryDate) : undefined,
        hsnCode: formData.hsnCode,
        barcode: formData.barcode,
        imageUrl: formData.imageUrl,
      });
    }
  }, [formData, isEditMode, form]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // Format data for API
      const apiData = {
        name: values.name,
        sku: values.sku,
        categoryId: values.categoryId,
        brand: values.brand || null,
        unit: values.unit,
        costPrice: values.costPrice,
        sellingPrice: values.sellingPrice,
        stock: values.stock,
        gstPercentage: values.gstPercentage,
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null,
        hsnCode: values.hsnCode || null,
        barcode: values.barcode || null,
        imageUrl: values.imageUrl || null,
      };

      if (isEditMode && formData?.id) {
        // Update existing product
        await updateProduct(formData.id, apiData);
        message.success('Product updated successfully!');
      } else {
        // Create new product
        await createProduct(apiData);
        message.success('Product created successfully!');
      }
      
      navigate('/product');
    } catch (error) {
      console.error('Error saving product:', error);
      message.error(getApiErrorMessage(error, 'Failed to save product'));
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
          onClick={() => navigate('/product')}
          className="mb-6"
        >
          Back to Product List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>}
          headStyle={{ 
            backgroundColor: 'var(--surface-1)', 
            color: 'var(--text-primary)',
            padding: '16px 24px', 
            margin: '-24px -24px 24px -24px', 
            width: 'calc(100% + 48px)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid var(--glass-border)'
          }}
          className="shadow-card bg-surface-1 product-form-card"
          style={{ boxShadow: 'var(--card-shadow)', overflow: 'hidden', backgroundColor: 'var(--surface-1)', borderColor: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}
          bodyStyle={{ backgroundColor: 'var(--surface-1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="product-form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" size="large" />
              </Form.Item>

              <Form.Item
                label="SKU"
                name="sku"
                rules={[{ required: true, message: 'Please enter SKU' }]}
              >
                <Input placeholder="Enter SKU (unique)" size="large" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Category"
                name="categoryId"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select
                  placeholder="Select category"
                  size="large"
                  loading={categoriesLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Brand"
                name="brand"
              >
                <Input placeholder="Enter brand name (optional)" size="large" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                label="Unit"
                name="unit"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select placeholder="Select unit" size="large">
                  <Option value="PCS">PCS</Option>
                  <Option value="KG">KG</Option>
                  <Option value="BOX">BOX</Option>
                  <Option value="LTR">LTR</Option>
                  <Option value="PACK">PACK</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Cost Price"
                name="costPrice"
                rules={[
                  { required: true, message: 'Please enter cost price' },
                  { type: 'number', min: 0, message: 'Cost price must be greater than or equal to 0' },
                ]}
              >
                <InputNumber
                  placeholder="Enter cost price"
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
                label="Selling Price"
                name="sellingPrice"
                rules={[
                  { required: true, message: 'Please enter selling price' },
                  { type: 'number', min: 0, message: 'Selling price must be greater than or equal to 0' },
                ]}
              >
                <InputNumber
                  placeholder="Enter selling price"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                label="Stock"
                name="stock"
                rules={[
                  { required: true, message: 'Please enter stock quantity' },
                  { type: 'number', min: 0, message: 'Stock must be greater than or equal to 0' },
                ]}
              >
                <InputNumber
                  placeholder="Enter stock quantity"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label="GST Percentage"
                name="gstPercentage"
                rules={[
                  { required: true, message: 'Please enter GST percentage' },
                  { type: 'number', min: 0, max: 100, message: 'GST percentage must be between 0 and 100' },
                ]}
              >
                <InputNumber
                  placeholder="Enter GST %"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  max={100}
                  formatter={(value) => value !== undefined && value !== null ? `${value}%` : ''}
                  parser={(value) => {
                    const cleaned = value?.replace(/%/g, '') || '';
                    const num = cleaned ? parseFloat(cleaned) : undefined;
                    return num as any;
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Expiry Date"
                name="expiryDate"
              >
                <DatePicker
                  placeholder="Select expiry date (optional)"
                  style={{ width: '100%' }}
                  size="large"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="HSN Code"
                name="hsnCode"
              >
                <Input placeholder="Enter HSN code (optional)" size="large" />
              </Form.Item>

              <Form.Item
                label="Barcode"
                name="barcode"
              >
                <Input placeholder="Enter barcode (optional)" size="large" />
              </Form.Item>
            </div>

            <Form.Item
              label="Image URL"
              name="imageUrl"
            >
              <Input placeholder="Enter image URL (optional)" size="large" />
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
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  onClick={() => navigate('/product')}
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


