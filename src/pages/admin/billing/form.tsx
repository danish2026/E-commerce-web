import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message, Divider, Select, notification } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { createOrder, updateOrder, Order, PaymentType } from './api';
import { fetchProducts, ProductDto } from '../product/ProductService';
import { useBillingTranslation } from '../../../hooks/useBillingTranslation';

interface OrderItemFormData {
  productId: string;
  product?: ProductDto;
  quantity: number;
  discount?: number;
  productError?: string;
  quantityError?: string;
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
    { productId: '', quantity: 1, discount: 0, productError: '', quantityError: '' } 
  ]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discounts, setDiscounts] = useState<number[]>([0]);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CASH);
  const [productsLoading, setProductsLoading] = useState(false);

  const loadProducts = useCallback(async (showMessage = false) => {
    try {
      setProductsLoading(true);
      let allProducts: ProductDto[] = [];
      let currentPage = 1;
      const pageSize = 99;
      let hasMore = true;

      while (hasMore) {
        const response = await fetchProducts(undefined, undefined, undefined, currentPage, pageSize);
        if (response?.data && Array.isArray(response.data)) {
          allProducts = [...allProducts, ...response.data];
          hasMore = response.meta?.hasNext || false;
          currentPage++;
        } else {
          hasMore = false;
        }
      }

      setProducts(allProducts);
      setItems(prevItems => prevItems.map(item => {
        if (item.productId) {
          const updatedProduct = allProducts.find(p => p.id === item.productId);
          if (updatedProduct) {
            return {
              ...item,
              product: updatedProduct,
              quantityError: item.quantityError && Number(item.quantity) <= Number(updatedProduct.stock) ? '' : item.quantityError
            };
          }
        }
        return item;
      }));

      if (showMessage) message.success('Products refreshed successfully');
    } catch (error) {
      console.error('Error loading products:', error);
      message.error(t.failedToLoadProducts);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const refresh = () => loadProducts(false);
    const handleVisibilityChange = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refresh);
    };
  }, [loadProducts]);

  useEffect(() => {
    if (existingOrder) {
      setCustomerName(existingOrder.customerName || '');
      setCustomerPhone(existingOrder.customerPhone || '');
      const existingDiscount = Number(existingOrder.discount) || 0;
      setDiscounts(existingDiscount > 0 ? [existingDiscount] : [0]);
      setPaymentType(existingOrder.paymentType);
      if (existingOrder.orderItems && existingOrder.orderItems.length > 0) {
        setItems(existingOrder.orderItems.map(item => ({
          productId: item.productId,
          product: item.product as ProductDto,
          quantity: Number(item.quantity) || 1,
          discount: (item as any).discount ? Number((item as any).discount) : 0,
          productError: '',
          quantityError: '',
        })));
      }
    }
  }, [existingOrder]);

  const getStockInfo = (productId: string, excludeIndex?: number, itemsToCheck = items) => {
    const allocated = itemsToCheck.reduce((total, item, idx) => {
      if (idx === excludeIndex) return total;
      if (item.productId === productId && item.quantity) {
        return total + (Number(item.quantity) || 0);
      }
      return total;
    }, 0);
    return { allocated };
  };

  const getRemainingQuantity = (product: ProductDto, excludeIndex?: number, itemsToCheck = items) => {
    const stock = Number(product.stock) || 0;
    const { allocated } = getStockInfo(product.id, excludeIndex, itemsToCheck);
    return Math.max(0, stock - allocated);
  };

  const getRemainingAfterCurrentItem = (product: ProductDto, currentQuantity: number, excludeIndex?: number) => {
    const stock = Number(product.stock) || 0;
    const { allocated } = getStockInfo(product.id, excludeIndex);
    return Math.max(0, stock - allocated - (Number(currentQuantity) || 0));
  };

  const validateItem = (item: OrderItemFormData, index: number, itemsToCheck: OrderItemFormData[]) => {
    if (!item.productId || !item.product) return item;
    const remaining = getRemainingQuantity(item.product, index, itemsToCheck);
    const stock = Number(item.product.stock) || 0;
    const { allocated } = getStockInfo(item.productId, index, itemsToCheck);
    const quantity = Number(item.quantity) || 0;
    const quantityError = quantity > remaining
      ? `Insufficient stock! Available: ${remaining} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`
      : '';
    return { ...item, quantityError };
  };

  const revalidateAllItems = (itemsToValidate?: OrderItemFormData[]) => {
    setItems(prevItems => {
      const itemsToCheck = itemsToValidate || prevItems;
      return itemsToCheck.map((item, index) => validateItem(item, index, itemsToCheck));
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const currentItem = items[index];
    let productError = '';
    let quantityError = '';
    let newQuantity = currentItem.quantity || 1;
    
    if (product) {
      if (product.expiryDate) {
        const expiryDate = new Date(product.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        if (expiryDate < today) {
          productError = `This product has expired on ${new Date(product.expiryDate).toLocaleDateString()}`;
        }
      }
      
      const remaining = getRemainingQuantity(product, index);
      if (newQuantity > remaining) {
        const { allocated } = getStockInfo(product.id, index);
        const stock = Number(product.stock) || 0;
        if (remaining > 0) {
          newQuantity = remaining;
          quantityError = `Quantity adjusted to ${remaining} (available stock).`;
        } else {
          newQuantity = 1;
          quantityError = `Insufficient stock! Available: ${remaining} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
        }
      }
    }
    
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], productId, product, quantity: newQuantity, productError, quantityError };
    setItems(updatedItems);
    setTimeout(() => revalidateAllItems(updatedItems), 0);
  };

  const handleQuantityChange = (index: number, quantity: number | null) => {
    const newQuantity = quantity === null ? null : (quantity || 0);
    
    setItems(prevItems => {
      const currentItem = prevItems[index];
      let quantityError = '';
      
      if (currentItem?.product) {
        const remaining = getRemainingQuantity(currentItem.product, index, prevItems);
        const stock = Number(currentItem.product.stock) || 0;
        const { allocated } = getStockInfo(currentItem.productId, index, prevItems);
        
        if (newQuantity === null || newQuantity === undefined) {
          quantityError = '';
        } else if (newQuantity <= 0) {
          quantityError = 'Quantity must be greater than 0';
        } else if (newQuantity > remaining) {
          quantityError = `Insufficient stock! Available: ${remaining} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
        }
      } else if (newQuantity !== null && newQuantity !== undefined && newQuantity <= 0) {
        quantityError = 'Quantity must be greater than 0';
      }
      
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: newQuantity !== null && newQuantity !== undefined ? newQuantity : (currentItem?.quantity || 1),
        quantityError,
        productError: currentItem?.productError || ''
      };
      
      return updatedItems.map((item, idx) => 
        idx === index ? item : validateItem(item, idx, updatedItems)
      );
    });
  };

  const handleDiscountChange = (index: number, discount: number | null) => {
    setItems(prevItems => {
      const updated = [...prevItems];
      updated[index] = { ...updated[index], discount: discount || 0 };
      return updated;
    });
  };

  const handleOrderDiscountChange = (index: number, amount: number | null) => {
    setDiscounts(prev => {
      const updated = [...prev];
      updated[index] = amount || 0;
      return updated;
    });
  };

  const handleAddDiscount = () => setDiscounts([...discounts, 0]);

  const handleRemoveDiscount = (index: number) => {
    if (discounts.length > 1) {
      setDiscounts(discounts.filter((_, i) => i !== index));
    } else {
      message.warning('At least one discount entry is required. Set it to 0 if no discount.');
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, discount: 0, productError: '', quantityError: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      setTimeout(() => revalidateAllItems(updatedItems), 0);
    } else {
      message.warning(t.atLeastOneItem);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0, gstTotal = 0, itemDiscountsTotal = 0;

    items.forEach(item => {
      if (item.product && item.quantity) {
        const unitPrice = Number(item.product.sellingPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        const itemSubtotal = unitPrice * quantity;
        const itemDiscount = Number(item.discount) || 0;
        const itemSubtotalAfterDiscount = Math.max(0, itemSubtotal - itemDiscount);
        subtotal += itemSubtotalAfterDiscount;
        itemDiscountsTotal += itemDiscount;
        gstTotal += (itemSubtotalAfterDiscount * (Number(item.product.gstPercentage) || 0)) / 100;
      }
    });

    const orderDiscountAmount = discounts.reduce((sum, disc) => sum + (Number(disc) || 0), 0);
    const grandTotal = subtotal + gstTotal - orderDiscountAmount;
    return { subtotal, gstTotal, itemDiscountsTotal, grandTotal, orderDiscountAmount };
  };

  const { subtotal, gstTotal, itemDiscountsTotal, grandTotal, orderDiscountAmount } = calculateTotals();

  const onFinish = async () => {
    try {
      const validItems = items.filter(item => item.productId && item.quantity > 0);

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

      const errorMessages: string[] = [];
      const updatedItems = [...items];

      items.forEach((item, i) => {
        if (!item.productId || !item.quantity) return;
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        let productError = '', quantityError = '';

        if (product.expiryDate) {
          const expiryDate = new Date(product.expiryDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);
          if (expiryDate < today) {
            productError = `This product has expired on ${new Date(product.expiryDate).toLocaleDateString()}`;
            errorMessages.push(`Item ${i + 1}: Product "${product.name}" has expired on ${new Date(product.expiryDate).toLocaleDateString()}`);
          }
        }

        const remaining = getRemainingQuantity(product, i);
        const requested = Number(item.quantity) || 0;
        if (requested > remaining) {
          const { allocated } = getStockInfo(product.id, i);
          const stock = Number(product.stock) || 0;
          quantityError = `Insufficient stock! Available: ${remaining} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
          errorMessages.push(`Item ${i + 1}: Insufficient stock for "${product.name}". Available: ${remaining} item(s) (Total stock: ${stock} - Already allocated: ${allocated}), but ${requested} requested.`);
        }

        if (productError || quantityError) {
          updatedItems[i] = { ...item, productError, quantityError };
        }
      });

      if (errorMessages.length > 0) {
        setItems(updatedItems);
        message.error('Cannot save order. Please fix the following errors:');
        notification.error({
          message: 'Validation Error',
          description: errorMessages.join('\n'),
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 8,
          placement: 'topRight',
        });
        return;
      }

      setLoading(true);
      const discountEntries = discounts.filter(d => d > 0).map(d => ({ amount: d }));
      const apiData: any = {
        paymentType,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: item.discount || 0
        }))
      };

      // Only add discounts when creating a new order, not when updating
      if (!isEditMode && discountEntries.length > 0) {
        apiData.discounts = discountEntries;
      }

      if (!isEditMode) {
        apiData.customerName = customerName || null;
        apiData.customerPhone = customerPhone || null;
      } else if (existingOrder) {
        if ((customerName || '') !== (existingOrder.customerName || '')) {
          apiData.customerName = customerName || null;
        }
        if ((customerPhone || '') !== (existingOrder.customerPhone || '')) {
          apiData.customerPhone = customerPhone || null;
        }
      }

      if (isEditMode && existingOrder?.id) {
        await updateOrder(existingOrder.id, apiData);
        navigate('/billing', { state: { successMessage: t.orderUpdated } });
      } else {
        await createOrder(apiData);
        navigate('/billing', { state: { successMessage: t.orderCreated } });
      }
    } catch (error: any) {
      console.error('Error saving order:', error);
      let errorMessage: string = t.failedToSave;
      
      if (error.response?.data) {
        const data = error.response.data;
        errorMessage = String(data.message || data.error || data || errorMessage);
      } else if (error.message) {
        errorMessage = String(error.message);
      }
      
      const errorMessageLower = errorMessage.toLowerCase();
      if (errorMessageLower.includes('expired') || errorMessageLower.includes('cannot create order')) {
        notification.error({
          message: t.orderCreationFailed,
          description: errorMessage,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 5,
          placement: 'topRight',
        });
      } else {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/billing')}
          >
            {t.backToOrdersList}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadProducts(true)}
            loading={productsLoading}
            type="default"
          >
            Refresh Products
          </Button>
        </div>

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
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </Form.Item>

                <Form.Item label={t.customerPhoneLabel}>
                  <Input
                    placeholder={t.customerPhonePlaceholder}
                    type="number"
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
              <div className="overflow-x-auto border border-[var(--glass-border)] rounded-lg">
                <table className="w-full">
                  <thead className="bg-[var(--surface-2)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                        {t.productLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                        {t.quantityLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                        {t.unitPrice}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                        {t.gstPercentage}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-t border-[var(--glass-border)]">
                        <td className="px-4 py-3 align-top">
                          <Form.Item
                            required
                            style={{ marginBottom: 0 }}
                            validateStatus={!item.productId || item.productError ? 'error' : ''}
                            help={item.productError || (!item.productId ? t.productRequired : '')}
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
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Form.Item
                            required
                            style={{ marginBottom: 0 }}
                            validateStatus={!item.quantity || item.quantity <= 0 || item.quantityError ? 'error' : ''}
                            help={
                              item.quantityError 
                                ? (
                                    <span style={{ color: '#ff4d4f', fontWeight: 500, fontSize: '13px' }}>
                                      {item.quantityError}
                                    </span>
                                  )
                                : (!item.quantity || item.quantity <= 0 ? t.quantityRequired : '')
                            }
                          >
                            <InputNumber
                              placeholder={t.quantityPlaceholder}
                              style={{ 
                                width: '100%',
                                borderColor: item.quantityError ? '#ff4d4f' : undefined
                              }}
                              size="large"
                              min={1}
                              // Don't set max to allow typing values above stock, but show error
                              value={item.quantity}
                              onChange={(value) => handleQuantityChange(index, value)}
                              onPressEnter={(e) => {
                                const target = e.target as HTMLInputElement;
                                handleQuantityChange(index, parseFloat(target.value) || null);
                              }}
                              onBlur={() => {
                                const currentItem = items[index];
                                const currentQuantity = Number(currentItem?.quantity) || 0;
                                
                                if (currentQuantity <= 0) {
                                  setItems(prev => {
                                    const updated = [...prev];
                                    updated[index] = { ...updated[index], quantity: 1, quantityError: '' };
                                    return updated;
                                  });
                                } else if (currentItem?.product) {
                                  const remaining = getRemainingQuantity(currentItem.product, index);
                                  if (currentQuantity > remaining) {
                                    const { allocated } = getStockInfo(currentItem.product.id, index);
                                    const stock = Number(currentItem.product.stock) || 0;
                                    const quantityError = `Insufficient stock! Available: ${remaining} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
                                    setItems(prev => {
                                      const updated = [...prev];
                                      updated[index] = { ...updated[index], quantityError };
                                      return updated;
                                    });
                                  } else if (currentItem.quantityError) {
                                    setItems(prev => {
                                      const updated = [...prev];
                                      updated[index] = { ...updated[index], quantityError: '' };
                                      return updated;
                                    });
                                  }
                                }
                                revalidateAllItems();
                              }}
                            />
                            {item.product && (
                              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                <div>Total stock: {Number(item.product.stock) || 0} item(s)</div>
                                <div style={{ color: Number(item.quantity) > 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                  Remaining after order: {getRemainingAfterCurrentItem(item.product, item.quantity || 0, index)} item(s)
                                </div>
                              </div>
                            )}
                          </Form.Item>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {item.product ? (
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              ₹{Number(item.product.sellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--text-secondary)]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          {item.product ? (
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              {Number(item.product.gstPercentage)}%
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--text-secondary)]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                  {t.addMoreItems}
                </Button>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Payment and Discount */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                {t.paymentAndDiscount}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Form.Item
                  label={t.paymentTypeLabel}
                  required
                  validateStatus={!paymentType ? 'error' : ''}
                  help={!paymentType ? t.paymentTypeRequired : ''}
                >
                  <Select
                    size="large"
                    value={paymentType}
                    onChange={setPaymentType}
                    options={[
                      { value: PaymentType.CASH, label: t.cash },
                      { value: PaymentType.CARD, label: t.card },
                      { value: PaymentType.UPI, label: t.upi },
                      { value: PaymentType.CREDIT, label: t.credit },
                    ]}
                  />
                </Form.Item>
              </div>

              {/* Discounts Section */}
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {t.discountLabel || 'Order Discounts'}
                </h4>
                <div className="space-y-3">
                  {discounts.map((discount, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Form.Item style={{ flex: 1, marginBottom: 0 }}>
                        <InputNumber
                          placeholder={t.discountPlaceholder || 'Discount Amount'}
                          style={{ width: '100%' }}
                          size="large"
                          min={0}
                          formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                          parser={(value) => {
                            const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                            return cleaned ? parseFloat(cleaned) : 0;
                          }}
                          value={discount}
                          onChange={(value) => handleOrderDiscountChange(index, value)}
                        />
                      </Form.Item>
                      {discounts.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveDiscount(index)}
                          size="large"
                        >
                          {t.remove}
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddDiscount}
                    block
                    size="large"
                    style={{ 
                      borderColor: 'var(--brand)',
                      color: 'var(--brand)',
                    }}
                  >
                    {t.addMoreItems || 'Add Discount'}
                  </Button>
                </div>
              </div>
            </div>

            <Divider className="my-6" />

            {/* Order Summary */}
            <div className="flex justify-end items-center mb-6 p-4 bg-[var(--surface-2)] rounded-lg border border-[var(--glass-border)]">
              <div className="text-right">
                <div className="space-y-2">
                  <div className="flex justify-between gap-8">
                    <span className="text-sm text-[var(--text-secondary)]">{t.subtotal}:</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-sm text-[var(--text-secondary)]">{t.gstTotal}:</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      ₹ {gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {itemDiscountsTotal > 0 && (
                    <div className="flex justify-between gap-8">
                      <span className="text-sm text-[var(--text-secondary)]">{t.discount || 'Item Discounts'}:</span>
                      <span className="text-sm font-semibold text-red-500">
                        - ₹ {itemDiscountsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {orderDiscountAmount > 0 && (
                    <div className="flex justify-between gap-8">
                      <span className="text-sm text-[var(--text-secondary)]">{t.discount || 'Order Discount'}:</span>
                      <span className="text-sm font-semibold text-red-500">
                        - ₹ {orderDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <Divider className="my-2" />
                  <div className="flex justify-between gap-8">
                    <span className="text-sm text-[var(--text-secondary)]">{t.grandTotal}:</span>
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
                  {isEditMode ? t.updateOrderButton : t.createOrderButton}
                </Button>
                <Button
                  onClick={() => navigate('/billing')}
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
}

export default BillingForm;
