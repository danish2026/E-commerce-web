import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message, Divider, Select, notification, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { createOrder, updateOrder, Order, PaymentType, OrderItem } from './api';
import { fetchProducts, ProductDto } from '../product/ProductService';
import { useBillingTranslation } from '../../../hooks/useBillingTranslation';

interface OrderItemFormData {
  productId: string;
  product?: ProductDto;
  quantity: number;
}

const BillingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, translate } = useBillingTranslation();
  const existingOrder = location.state as Order | null;
  const isEditMode = !!existingOrder;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [items, setItems] = useState<OrderItemFormData[]>([
    { productId: '', quantity: 1 }
  ]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Fetch all products with pagination (API limit is 100 per page, using 99 to stay within limit)
        let allProducts: ProductDto[] = [];
        let currentPage = 1;
        const pageSize = 99;
        let hasMore = true;

        while (hasMore) {
          const response = await fetchProducts(undefined, undefined, undefined, currentPage, pageSize);
          
          if (response && response.data && Array.isArray(response.data)) {
            allProducts = [...allProducts, ...response.data];
            
            // Check if there are more pages
            hasMore = response.meta?.hasNext || false;
            currentPage++;
          } else {
            console.error('Invalid response structure:', response);
            hasMore = false;
          }
        }

        console.log('Loaded products:', allProducts.length, 'products');
        setProducts(allProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        message.error(t.failedToLoadProducts);
        setProducts([]);
      }
    };
    loadProducts();
  }, [t]);

  // Load existing order data if in edit mode
  useEffect(() => {
    if (existingOrder) {
      setCustomerName(existingOrder.customerName || '');
      setCustomerPhone(existingOrder.customerPhone || '');
      setDiscount(Number(existingOrder.discount) || 0);
      setPaymentType(existingOrder.paymentType);
      
      if (existingOrder.orderItems && existingOrder.orderItems.length > 0) {
        const formItems: OrderItemFormData[] = existingOrder.orderItems.map(item => ({
          productId: item.productId,
          product: item.product as ProductDto,
          quantity: Number(item.quantity) || 1,
        }));
        setItems(formItems);
      }
    }
  }, [existingOrder]);

  const updateItem = (index: number, updatedFields: Partial<OrderItemFormData>) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], ...updatedFields };
      return updatedItems;
    });
  };

  // Handle product selection for an item
  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    
    if (product) {
      // Check if product is expired
      if (product.expiryDate) {
        const expiryDate = new Date(product.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) {
          Modal.warning({
            title: t.productExpired,
            content: translate('productExpiredMessage', { 
              name: product.name, 
              date: new Date(product.expiryDate).toLocaleDateString() 
            }),
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            okText: t.iUnderstand,
            width: 500,
          });
        }
      }
      
      // Check if product has low stock (10 or less)
      const stock = Number(product.stock) || 0;
      if (stock <= 10) {
        notification.warning({
          message: t.lowStockAlert,
          description: translate('lowStockMessage', { 
            name: product.name, 
            stock: stock 
          }),
          icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
          duration: 5,
          placement: 'topRight',
        });
      }
    }
    
    updateItem(index, { productId, product });
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, quantity: number | null) => {
    updateItem(index, { quantity: quantity || 1 });
  };

  // Add a new item
  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  // Remove an item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    } else {
      message.warning(t.atLeastOneItem);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;

    items.forEach(item => {
      if (item.product && item.quantity) {
        const unitPrice = Number(item.product.sellingPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        const itemSubtotal = unitPrice * quantity;
        subtotal += itemSubtotal;

        const gstPercent = Number(item.product.gstPercentage) || 0;
        const itemGst = (itemSubtotal * gstPercent) / 100;
        gstTotal += itemGst;
      }
    });

    const discountAmount = discount || 0;
    const grandTotal = subtotal + gstTotal - discountAmount;

    return { subtotal, gstTotal, grandTotal };
  };

  const { subtotal, gstTotal, grandTotal } = calculateTotals();

  const onFinish = async () => {
    try {
      // Log customer form payload for debugging
      console.log('Customer Form Payload:', { customerName, customerPhone });
      // Validate all items
      const validItems = items.filter(item => 
        item.productId && item.quantity > 0
      );

      if (validItems.length === 0) {
        message.error(t.addAtLeastOneItem);
        return;
      }

      if (validItems.length !== items.length) {
        message.error(t.fillAllRequiredFields);
        return;
      }

      if (!paymentType) {
        message.error(t.selectPaymentType);
        return;
      }

      setLoading(true);

      // Format data for API
      // For updates, only include customer fields if they were changed
      const baseData: any = {
        discount: discount || 0,
        paymentType: paymentType,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const apiData: any = { ...baseData };

      if (!isEditMode) {
        // For create, include customer fields (can be null)
        apiData.customerName = customerName || null;
        apiData.customerPhone = customerPhone || null;
      } else if (existingOrder) {
        // For update, include customer fields only when changed
        if ((customerName || '') !== (existingOrder.customerName || '')) {
          apiData.customerName = customerName || null;
        }
        if ((customerPhone || '') !== (existingOrder.customerPhone || '')) {
          apiData.customerPhone = customerPhone || null;
        }
      }

      // Log the full API payload before sending
      console.log('Order API Payload:', apiData);

      if (isEditMode && existingOrder?.id) {
        await updateOrder(existingOrder.id, apiData);
        message.success(t.orderUpdated);
      } else {
        await createOrder(apiData);
        message.success(t.orderCreated);
      }
      
      navigate('/billing');
    } catch (error: any) {
      console.error('Error saving order:', error);
      
      // Extract error message from API response
      let errorMessage = t.failedToSave;
      
      if (error.response?.data) {
        // Handle NestJS error response format
        errorMessage = error.response.data.message || 
                      error.response.data.error || 
                      error.response.data || 
                      errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show prominent notification for important errors (like expired products)
      if (errorMessage.toLowerCase().includes('expired') || 
          errorMessage.toLowerCase().includes('cannot create order')) {
        notification.error({
          message: t.orderCreationFailed,
          description: errorMessage,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 5, // Show for 5 seconds
          placement: 'topRight',
        });
      } else {
        // Use regular message for other errors
        message.error(errorMessage);
      }
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
          {t.backToOrdersList}
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold p-4 mt-[20px] m-0" style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? t.editOrder : t.createNewOrder}
          </h2>}
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
            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t.customerInformation}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label={t.customerNameLabel}>
                  <Input
                    placeholder={t.customerNamePlaceholder}
                    size="large"
                    value={customerName}
                    onChange={(e) => { setCustomerName(e.target.value);
                       }}
                  />
                </Form.Item>

                <Form.Item label={t.customerPhoneLabel}>
                  <Input
                    placeholder={t.customerPhonePlaceholder}
                    size="large"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </Form.Item>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t.orderItems}
              </h3>
              {items.map((item, index) => (
                <div key={index} className="mb-4 p-4 border border-[var(--glass-border)] rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {t.item} {index + 1}
                    </h4>
                    {items.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(index)}
                        size="small"
                      >
                        {t.remove}
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label={t.productLabel}
                      required
                      validateStatus={!item.productId ? 'error' : ''}
                      help={!item.productId ? t.productRequired : ''}
                    >
                      <Select
                        showSearch
                        size="large"
                        placeholder={products.length === 0 ? t.loadingProducts : t.selectProduct}
                        value={item.productId || undefined}
                        onChange={(value) => handleProductSelect(index, value)}
                        optionFilterProp="label"
                        filterOption={(input, option) =>
                          (option?.label as string)
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        notFoundContent={products.length === 0 ? t.noProductsAvailable : t.noProductsFound}
                        options={products
                          .filter(product => product && product.id && product.name)
                          .map(product => ({
                            value: product.id,
                            label: `${product.name}${product.sku ? ` (${product.sku})` : ''}`,
                          }))}
                      />
                    </Form.Item>

                    <Form.Item
                      label={t.quantityLabel}
                      required
                      validateStatus={!item.quantity || item.quantity <= 0 ? 'error' : ''}
                      help={!item.quantity || item.quantity <= 0 ? t.quantityRequired : ''}
                    >
                      <InputNumber
                        placeholder={t.quantityPlaceholder}
                        style={{ width: '100%' }}
                        size="large"
                        min={1}
                        value={item.quantity}
                        onChange={(value) => handleQuantityChange(index, value)}
                      />
                    </Form.Item>
                  </div>

                  {item.product && (
                    <div className="mt-4 p-3 bg-[var(--surface-2)] rounded">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">{t.unitPrice}:</span>
                          <span className="ml-2 font-semibold text-[var(--text-primary)]">
                            ₹{Number(item.product.sellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">{t.gstPercentage}:</span>
                          <span className="ml-2 font-semibold text-[var(--text-primary)]">
                            {Number(item.product.gstPercentage)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">{t.itemSubtotal}:</span>
                          <span className="ml-2 font-semibold text-[var(--text-primary)]">
                            ₹{(Number(item.product.sellingPrice) * Number(item.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">{t.gstAmount}:</span>
                          <span className="ml-2 font-semibold text-[var(--text-primary)]">
                            ₹{((Number(item.product.sellingPrice) * Number(item.quantity) * Number(item.product.gstPercentage)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {index < items.length - 1 && <Divider className="my-4" />}
                </div>
              ))}

              <div className="mt-4">
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
            </div>

            <Divider className="my-6" />

            {/* Payment and Discount */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Payment & Discount
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Payment Type"
                  required
                  validateStatus={!paymentType ? 'error' : ''}
                  help={!paymentType ? 'Payment type is required' : ''}
                >
                  <Select
                    size="large"
                    value={paymentType}
                    onChange={setPaymentType}
                    options={[
                      { value: PaymentType.CASH, label: 'Cash' },
                      { value: PaymentType.CARD, label: 'Card' },
                      { value: PaymentType.UPI, label: 'UPI' },
                      { value: PaymentType.CREDIT, label: 'Credit' },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Discount">
                  <InputNumber
                    placeholder="Enter discount amount"
                    style={{ width: '100%' }}
                    size="large"
                    min={0}
                    formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                    parser={(value) => {
                      const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                      return cleaned ? parseFloat(cleaned) : 0;
                    }}
                    value={discount}
                    onChange={(value) => setDiscount(value || 0)}
                  />
                </Form.Item>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Order Summary */}
            <div className="flex justify-end items-center mb-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--glass-border)]">
              <div className="text-right">
                <div className="space-y-2">
                  <div className="flex justify-between gap-8">
                    <span className="text-sm text-[var(--text-secondary)]">Subtotal:</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-sm text-[var(--text-secondary)]">GST Total:</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      ₹ {gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between gap-8">
                      <span className="text-sm text-[var(--text-secondary)]">Discount:</span>
                      <span className="text-sm font-semibold text-red-500">
                        - ₹ {discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <Divider className="my-2" />
                  <div className="flex justify-between gap-8">
                    <span className="text-sm text-[var(--text-secondary)]">Grand Total:</span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
                      ₹ {(grandTotal ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
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
                  {isEditMode ? 'Update Order' : 'Create Order'}
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
