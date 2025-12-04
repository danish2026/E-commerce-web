import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message, Select, DatePicker } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { createProduct, getApiErrorMessage, updateProduct, fetchCategories, CategoryDto } from './ProductService';
import { useProductTranslation } from '../../../hooks/useProductTranslation';

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
  const { t } = useProductTranslation();
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
        message.error(getApiErrorMessage(error, t.failedToLoadCategories));
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
        message.success(t.productUpdated);
      } else {
        // Create new product
        await createProduct(apiData);
        message.success(t.productCreated);
      }
      
      navigate('/product');
    } catch (error) {
      console.error('Error saving product:', error);
      message.error(getApiErrorMessage(error, t.failedToSave));
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
    message.error(t.fillRequiredFields);
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/product')}
          className="mb-6"
        >
          {t.backToProductList}
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>{isEditMode ? t.editProduct : t.addNewProduct}</h2>}
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
                label={t.productNameLabel}
                name="name"
                rules={[{ required: true, message: t.productNameRequired }]}
              >
                <Input placeholder={t.productNamePlaceholder} size="large" />
              </Form.Item>

              <Form.Item
                label={t.skuLabel}
                name="sku"
                rules={[{ required: true, message: t.skuRequired }]}
              >
                <Input placeholder={t.skuPlaceholder} size="large" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={t.categoryLabel}
                name="categoryId"
                rules={[{ required: true, message: t.categoryRequired }]}
              >
                <Select
                  placeholder={t.categoryPlaceholder}
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
                label={t.brandLabel}
                name="brand"
              >
                <Input placeholder={t.brandPlaceholder} size="large" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                label={t.unitLabel}
                name="unit"
                rules={[{ required: true, message: t.unitRequired }]}
              >
                <Select placeholder={t.unitPlaceholder} size="large">
                  <Option value="PCS">PCS</Option>
                  <Option value="KG">KG</Option>
                  <Option value="BOX">BOX</Option>
                  <Option value="LTR">LTR</Option>
                  <Option value="PACK">PACK</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={t.costPriceLabel}
                name="costPrice"
                rules={[
                  { required: true, message: t.costPriceRequired },
                  { type: 'number', min: 0, message: t.costPriceMin },
                ]}
              >
                <InputNumber
                  placeholder={t.costPricePlaceholder}
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
                label={t.sellingPriceLabel}
                name="sellingPrice"
                rules={[
                  { required: true, message: t.sellingPriceRequired },
                  { type: 'number', min: 0, message: t.sellingPriceMin },
                ]}
              >
                <InputNumber
                  placeholder={t.sellingPricePlaceholder}
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
                label={t.stockLabel}
                name="stock"
                rules={[
                  { required: true, message: t.stockRequired },
                  { type: 'number', min: 0, message: t.stockMin },
                ]}
              >
                <InputNumber
                  placeholder={t.stockPlaceholder}
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label={t.gstPercentageLabel}
                name="gstPercentage"
                rules={[
                  { required: true, message: t.gstPercentageRequired },
                  { type: 'number', min: 0, max: 100, message: t.gstPercentageRange },
                ]}
              >
                <InputNumber
                  placeholder={t.gstPercentagePlaceholder}
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
                label={t.expiryDateLabel}
                name="expiryDate"
              >
                <DatePicker
                  placeholder={t.expiryDatePlaceholder}
                  style={{ width: '100%' }}
                  size="large"
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={t.hsnCodeLabel}
                name="hsnCode"
              >
                <Input placeholder={t.hsnCodePlaceholder} size="large" />
              </Form.Item>

              <Form.Item
                label={t.barcodeLabel}
                name="barcode"
              >
                <Input placeholder={t.barcodePlaceholder} size="large" />
              </Form.Item>
            </div>

            <Form.Item
              label={t.imageUrlLabel}
              name="imageUrl"
            >
              <Input placeholder={t.imageUrlPlaceholder} size="large" />
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
                  {isEditMode ? t.updateProduct : t.createProduct}
                </Button>
                <Button
                  onClick={() => navigate('/product')}
                  size="large"
                >
                  {t.cancel}
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




