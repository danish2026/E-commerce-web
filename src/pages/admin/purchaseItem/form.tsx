import  { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message, AutoComplete } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { createPurchaseItem, getApiErrorMessage, updatePurchaseItem } from './PurchaseItemService';
import { fetchPurchases, PurchaseDto } from '../purchase/PurcherseService';
import { usePurchaseTranslation } from '../../../hooks/usePurchaseTranslation';


interface PurchaseItemFormData {
  id?: string;
  item: string;
  description?: string;
  quantity: string;
  price: string;
  total: string;
  supplier?: string | null;
  buyer?: string | null;
  mode?: 'add' | 'edit';
}

const FormComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = usePurchaseTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [allBuyers, setAllBuyers] = useState<string[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<string[]>([]);
  const [supplierBuyerMap, setSupplierBuyerMap] = useState<Map<string, Set<string>>>(new Map());
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const formData = location.state as PurchaseItemFormData | null;
  const isEditMode = formData?.mode === 'edit' || (formData?.id && formData?.mode !== 'add');

  // Fetch suppliers and buyers from purchase API
  useEffect(() => {
    const fetchSuppliersAndBuyers = async () => {
      try {
        setLoadingSuppliers(true);
        setLoadingBuyers(true);
        
        // Fetch purchases - start with page 1 and limit 100
        // If there are more pages, we'll fetch them too
        const suppliersSet = new Set<string>();
        const buyersSet = new Set<string>();
        const supplierBuyerRelations = new Map<string, Set<string>>();
        
        let currentPage = 1;
        const limit = 100;
        let hasMore = true;
        
        // Fetch all pages to get complete list of suppliers and buyers
        while (hasMore) {
          const response = await fetchPurchases(undefined, undefined, undefined, undefined, currentPage, limit);
          
          // Extract suppliers and buyers from this page and build supplier-buyer relationships
          response.data.forEach((purchase: PurchaseDto) => {
            if (purchase.supplier && purchase.buyer) {
              suppliersSet.add(purchase.supplier);
              buyersSet.add(purchase.buyer);
              
              // Build supplier-buyer relationship map
              if (!supplierBuyerRelations.has(purchase.supplier)) {
                supplierBuyerRelations.set(purchase.supplier, new Set<string>());
              }
              supplierBuyerRelations.get(purchase.supplier)!.add(purchase.buyer);
            }
          });
          
          // Check if there are more pages
          const totalPages = Math.ceil(response.total / limit);
          hasMore = currentPage < totalPages;
          currentPage++;
          
          // Safety limit to prevent infinite loops
          if (currentPage > 50) {
            console.warn('Reached maximum page limit while fetching suppliers and buyers');
            break;
          }
        }
        
        // Convert Sets to sorted arrays
        const suppliersList = Array.from(suppliersSet).sort();
        const buyersList = Array.from(buyersSet).sort();
        
        setSuppliers(suppliersList);
        setAllBuyers(buyersList);
        setSupplierBuyerMap(supplierBuyerRelations);
        
        // If in edit mode and supplier is already set, filter buyers
        if (isEditMode && formData?.supplier) {
          const buyersForSupplier = supplierBuyerRelations.get(formData.supplier);
          if (buyersForSupplier) {
            setFilteredBuyers(Array.from(buyersForSupplier).sort());
          } else {
            setFilteredBuyers([]);
          }
        }
      } catch (error) {
        console.error('Error fetching suppliers and buyers from purchases:', error);
        message.error(t.failedToFetchPurchaseItems);
        // Don't block the form, just use empty arrays
      } finally {
        setLoadingSuppliers(false);
        setLoadingBuyers(false);
      }
    };
    fetchSuppliersAndBuyers();
  }, []);

  useEffect(() => {
    if (formData && isEditMode) {
      form.setFieldsValue({
        item: formData.item,
        description: formData.description,
        quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        total: formData.total ? parseFloat(formData.total) : undefined,
        supplier: formData.supplier || undefined,
        buyer: formData.buyer || undefined,
      });
    }
  }, [formData, isEditMode, form]);

  // Filter buyers when supplier is set in edit mode and supplier-buyer map is ready
  useEffect(() => {
    if (formData && isEditMode && formData.supplier && supplierBuyerMap.size > 0) {
      const buyersForSupplier = supplierBuyerMap.get(formData.supplier);
      if (buyersForSupplier) {
        setFilteredBuyers(Array.from(buyersForSupplier).sort());
      } else {
        setFilteredBuyers([]);
      }
    }
  }, [formData, isEditMode, supplierBuyerMap]);

  // Handle supplier change - filter buyers based on selected supplier
  const handleSupplierChange = (value: string) => {
    if (value) {
      // Get buyers for the selected supplier
      const buyersForSupplier = supplierBuyerMap.get(value);
      if (buyersForSupplier) {
        const filtered = Array.from(buyersForSupplier).sort();
        setFilteredBuyers(filtered);
        
        // Check if current buyer is valid for the new supplier
        const currentBuyer = form.getFieldValue('buyer');
        if (currentBuyer && !buyersForSupplier.has(currentBuyer)) {
          // Clear buyer if it's not valid for the selected supplier
          form.setFieldsValue({ buyer: undefined });
        }
      } else {
        setFilteredBuyers([]);
        // Clear buyer if no buyers found for this supplier
        form.setFieldsValue({ buyer: undefined });
      }
    } else {
      // If supplier is cleared, show all buyers
      setFilteredBuyers(allBuyers);
    }
  };

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
      const apiData: any = {
        item: values.item,
        description: values.description || undefined,
        quantity: values.quantity,
        price: values.price,
        total: values.total || (values.quantity * values.price),
      };

      // Add supplier and buyer if provided
      if (values.supplier) {
        apiData.supplier = values.supplier;
      }
      if (values.buyer) {
        apiData.buyer = values.buyer;
      }

      if (isEditMode && formData?.id) {
        // Update existing purchase item
        await updatePurchaseItem(formData.id, apiData);
        // Navigate to main page with success message
        navigate('/purchase-item', { state: { successMessage: t.purchaseItemUpdated } });
      } else {
        // Create new purchase item
        await createPurchaseItem(apiData);
        // Navigate to main page with success message
        navigate('/purchase-item', { state: { successMessage: t.purchaseItemCreated } });
      }
    } catch (error) {
      console.error('Error saving purchase item:', error);
      message.error(getApiErrorMessage(error, t.failedToSavePurchaseItem));
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
          onClick={() => navigate('/purchase-item')}
          className="mb-6"
        >
          {t.backToPurchaseItemList}
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>{isEditMode ? t.editPurchaseItem : t.addNewPurchaseItem}</h2>}
          headStyle={{ 
            backgroundColor: 'var(--surface-1)', 
            color: 'var(--text-primary)',
            padding: '16px 24px', 
            margin: '-24px -24px 24px -24px', 
            width: 'calc(100% + 48px)',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid var(--glass-border)'
          }}
          className="shadow-card bg-surface-1 purchase-form-card"
          style={{ boxShadow: 'var(--card-shadow)', overflow: 'hidden', backgroundColor: 'var(--surface-1)', borderColor: 'var(--glass-border)', border: '1px solid var(--glass-border)' }}
          bodyStyle={{ backgroundColor: 'var(--surface-1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            className="purchase-form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={t.itemLabel}
                name="item"
                rules={[{ required: true, message: t.itemRequired }]}
              >
                <Input placeholder={t.itemPlaceholder} size="large" />
              </Form.Item>

              <Form.Item
                label={t.quantityLabel}
                name="quantity"
                rules={[
                  { required: true, message: t.quantityRequired },
                  { type: 'number', min: 1, message: t.quantityMin },
                ]}
              >
                <InputNumber
                  placeholder={t.quantityPlaceholder}
                  style={{ width: '100%' }}
                  size="large"
                  type='number'
                  min={1}
                  onChange={handleQuantityOrPriceChange}
                />
              </Form.Item>
            </div>

         

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={t.supplierLabel}
                name="supplier"
              >
                <AutoComplete
                  placeholder={t.supplierPlaceholder}
                  size="large"
                  options={suppliers.map(supplier => ({ value: supplier }))}
                  filterOption={(inputValue, option) =>
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  allowClear
                  onChange={handleSupplierChange}
                />
              </Form.Item>

              <Form.Item
                label={t.buyerLabel}
                name="buyer"
              >
                <AutoComplete
                  placeholder={
                    form.getFieldValue('supplier') 
                      ? t.buyerPlaceholder
                      : t.buyerPlaceholder
                  }
                  size="large"
                  options={
                    form.getFieldValue('supplier') && filteredBuyers.length > 0
                      ? filteredBuyers.map(buyer => ({ value: buyer }))
                      : form.getFieldValue('supplier') && filteredBuyers.length === 0
                      ? [] // No buyers for this supplier
                      : allBuyers.map(buyer => ({ value: buyer })) // Show all buyers if no supplier selected
                  }
                  filterOption={(inputValue, option) =>
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  allowClear
                />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={t.priceLabel}
              name="price"
              rules={[
                { required: true, message: t.priceRequired },
                { type: 'number', min: 0, message: t.priceMin },
              ]}
            >
              <InputNumber
                placeholder={t.pricePlaceholder}
                style={{ width: '100%' }}
                size="large"
                min={0}
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
              label={t.totalLabel}
              name="total"
              rules={[
                { required: true, message: t.totalRequired },
                { type: 'number', min: 0, message: t.totalMin },
              ]}
            >
              <InputNumber
                placeholder={t.totalPlaceholder}
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
            <Form.Item
              label={t.descriptionLabel}
              name="description"
            >
              <Input.TextArea 
                placeholder={t.descriptionPlaceholder} 
                size="large"
                rows={3}
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
                  {isEditMode ? t.updatePurchaseItem : t.createPurchaseItem}
                </Button>
                <Button
                  onClick={() => navigate('/purchase-item')}
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

