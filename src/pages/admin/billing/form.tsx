import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, Space, message, Divider, Select, notification, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { createOrder, updateOrder, Order, PaymentType, OrderItem } from './api';
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

  // Load products function - can be called manually or on mount
  const loadProducts = useCallback(async (showMessage = false) => {
    try {
      setProductsLoading(true);
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
      
      // Update products state
      setProducts(allProducts);
      
      // Update product references in items to reflect new stock values
      setItems(prevItems => {
        return prevItems.map(item => {
          if (item.productId) {
            const updatedProduct = allProducts.find(p => p.id === item.productId);
            if (updatedProduct) {
              return {
                ...item,
                product: updatedProduct,
                // Clear quantity error if stock is now sufficient
                quantityError: item.quantityError && Number(item.quantity) <= Number(updatedProduct.stock) ? '' : item.quantityError
              };
            }
          }
          return item;
        });
      });

      if (showMessage) {
        message.success('Products refreshed successfully');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error(t.failedToLoadProducts);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [t]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Refresh products when window regains focus (user might have updated stock in another tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh products when tab becomes visible
        loadProducts(false);
      }
    };

    const handleFocus = () => {
      // Also refresh on window focus
      loadProducts(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadProducts]);

  // Load existing order data if in edit mode
  useEffect(() => {
    if (existingOrder) {
      setCustomerName(existingOrder.customerName || '');
      setCustomerPhone(existingOrder.customerPhone || '');
      // For edit mode, initialize with a single discount entry (backward compatibility)
      const existingDiscount = Number(existingOrder.discount) || 0;
      setDiscounts(existingDiscount > 0 ? [existingDiscount] : [0]);
      setPaymentType(existingOrder.paymentType);
      
      if (existingOrder.orderItems && existingOrder.orderItems.length > 0) {
        const formItems: OrderItemFormData[] = existingOrder.orderItems.map(item => ({
          productId: item.productId,
          product: item.product as ProductDto,
          quantity: Number(item.quantity) || 1,
          discount: (item as any).discount ? Number((item as any).discount) : 0,
          productError: '',
          quantityError: '',
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

  // Calculate allocated quantity for each product (excluding current item being edited)
  const calculateAllocatedQuantity = (productId: string, excludeIndex?: number): number => {
    return items.reduce((total, item, index) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return total; // Exclude current item from calculation
      }
      if (item.productId === productId && item.quantity) {
        return total + (Number(item.quantity) || 0);
      }
      return total;
    }, 0);
  };

  // Get remaining quantity for a product (after excluding allocated quantities in current order)
  const getRemainingQuantity = (product: ProductDto, excludeIndex?: number): number => {
    const stock = Number(product.stock) || 0;
    const allocated = calculateAllocatedQuantity(product.id, excludeIndex);
    return Math.max(0, stock - allocated);
  };

  // Get remaining quantity after current item's quantity is also deducted
  const getRemainingAfterCurrentItem = (product: ProductDto, currentQuantity: number, excludeIndex?: number): number => {
    const stock = Number(product.stock) || 0;
    const allocated = calculateAllocatedQuantity(product.id, excludeIndex);
    const totalAllocated = allocated + (Number(currentQuantity) || 0);
    return Math.max(0, stock - totalAllocated);
  };

  // Revalidate all items to ensure quantities don't exceed remaining stock
  const revalidateAllItems = (itemsToValidate?: OrderItemFormData[]) => {
    setItems(prevItems => {
      const itemsToCheck = itemsToValidate || prevItems;
      return itemsToCheck.map((item, index) => {
        if (!item.productId || !item.product) {
          return item;
        }

        // Calculate allocated quantity excluding current item
        const allocated = itemsToCheck.reduce((total, itm, idx) => {
          if (idx === index) return total;
          if (itm.productId === item.productId && itm.quantity) {
            return total + (Number(itm.quantity) || 0);
          }
          return total;
        }, 0);

        const stock = Number(item.product.stock) || 0;
        const remainingQuantity = Math.max(0, stock - allocated);
        const currentQuantity = Number(item.quantity) || 0;

        let quantityError = '';
        if (currentQuantity > remainingQuantity) {
          quantityError = `Insufficient stock! Available: ${remainingQuantity} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
        }

        return {
          ...item,
          quantityError,
        };
      });
    });
  };

  // Handle product selection for an item
  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const currentItem = items[index];
    let productError = '';
    let quantityError = '';
    let newQuantity = currentItem.quantity || 1;
    
    if (product) {
      // Check if product is expired
      if (product.expiryDate) {
        const expiryDate = new Date(product.expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expiryDate.setHours(0, 0, 0, 0);
        
        if (expiryDate < today) {
          productError = `This product has expired on ${new Date(product.expiryDate).toLocaleDateString()}`;
        }
      }
      
      // Check quantity against remaining stock (excluding current item)
      const remainingQuantity = getRemainingQuantity(product, index);
      
      // Auto-adjust quantity if it exceeds remaining stock
      if (newQuantity > remainingQuantity) {
        const allocated = calculateAllocatedQuantity(product.id, index);
        const stock = Number(product.stock) || 0;
        if (remainingQuantity > 0) {
          newQuantity = remainingQuantity;
          quantityError = `Quantity adjusted to ${remainingQuantity} (available stock).`;
        } else {
          newQuantity = 1;
          quantityError = `Insufficient stock! Available: ${remainingQuantity} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
        }
      }
    }
    
    // Update the item
    const updatedItems = [...items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      productId, 
      product, 
      quantity: newQuantity, 
      productError, 
      quantityError 
    };
    setItems(updatedItems);
    
    // Revalidate all items with the updated items array
    setTimeout(() => {
      revalidateAllItems(updatedItems);
    }, 0);
  };

  // Handle quantity change - validates on every onChange event
  const handleQuantityChange = (index: number, quantity: number | null) => {
    // Preserve the actual entered value (null becomes 0 for validation but we keep null for display)
    const newQuantity = quantity === null ? null : (quantity || 0);
    
    setItems(prevItems => {
      const currentItem = prevItems[index];
      let quantityError = '';
      
      // Check if product is selected and validate against remaining stock
      if (currentItem?.product) {
        // Calculate remaining quantity excluding current item
        const allocated = prevItems.reduce((total, itm, idx) => {
          if (idx === index) return total; // Exclude current item
          if (itm.productId === currentItem.productId && itm.quantity) {
            return total + (Number(itm.quantity) || 0);
          }
          return total;
        }, 0);
        
        const stock = Number(currentItem.product.stock) || 0;
        const remainingQuantity = Math.max(0, stock - allocated);
        
        // Validate quantity on every change - show error immediately if exceeds stock
        if (newQuantity === null || newQuantity === undefined) {
          // User is typing, no error yet
          quantityError = '';
        } else if (newQuantity <= 0) {
          quantityError = 'Quantity must be greater than 0';
        } else if (newQuantity > remainingQuantity) {
          // Show clear error with stock count immediately
          quantityError = `Insufficient stock! Available: ${remainingQuantity} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
        } else {
          // Clear error if quantity is valid
          quantityError = '';
        }
      } else if (newQuantity !== null && newQuantity !== undefined && newQuantity <= 0) {
        quantityError = 'Quantity must be greater than 0';
      }
      
      // Update the current item - preserve the actual entered value
      const updatedItems = [...prevItems];
      updatedItems[index] = { 
        ...updatedItems[index], 
        quantity: newQuantity !== null && newQuantity !== undefined ? newQuantity : (currentItem?.quantity || 1), 
        quantityError,
        productError: currentItem?.productError || ''
      };
      
      // Revalidate all other items to ensure they don't conflict
      const finalItems = updatedItems.map((item, idx) => {
        if (idx === index || !item.productId || !item.product) {
          return item; // Skip current item or items without product
        }
        
        // Calculate allocated quantity excluding the item being validated
        const itemAllocated = updatedItems.reduce((total, itm, itmIdx) => {
          if (itmIdx === idx) return total; // Exclude current item
          if (itm.productId === item.productId && itm.quantity) {
            return total + (Number(itm.quantity) || 0);
          }
          return total;
        }, 0);
        
        const itemStock = Number(item.product.stock) || 0;
        const itemRemainingQuantity = Math.max(0, itemStock - itemAllocated);
        const itemCurrentQuantity = Number(item.quantity) || 0;
        
        let itemQuantityError = '';
        if (itemCurrentQuantity > itemRemainingQuantity) {
          itemQuantityError = `Insufficient stock! Available: ${itemRemainingQuantity} item(s) (Total stock: ${itemStock} - Already allocated: ${itemAllocated})`;
        }
        
        return {
          ...item,
          quantityError: itemQuantityError,
        };
      });
      
      return finalItems;
    });
  };

  // Handle discount change for items
  const handleDiscountChange = (index: number, discount: number | null) => {
    const updatedItems = [...items];
    updatedItems[index] = { 
      ...updatedItems[index], 
      discount: discount || 0
    };
    setItems(updatedItems);
  };

  // Handle order-level discount change
  const handleOrderDiscountChange = (index: number, amount: number | null) => {
    const updatedDiscounts = [...discounts];
    updatedDiscounts[index] = amount || 0;
    setDiscounts(updatedDiscounts);
  };

  // Add a new discount entry
  const handleAddDiscount = () => {
    setDiscounts([...discounts, 0]);
  };

  // Remove a discount entry
  const handleRemoveDiscount = (index: number) => {
    if (discounts.length > 1) {
      const updatedDiscounts = discounts.filter((_, i) => i !== index);
      setDiscounts(updatedDiscounts);
    } else {
      message.warning('At least one discount entry is required. Set it to 0 if no discount.');
    }
  };

  // Add a new item
  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, discount: 0, productError: '', quantityError: '' }]);
  };

  // Remove an item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      // Revalidate all items after removal
      setTimeout(() => {
        revalidateAllItems(updatedItems);
      }, 0);
    } else {
      message.warning(t.atLeastOneItem);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;
    let itemDiscountsTotal = 0;

    items.forEach(item => {
      if (item.product && item.quantity) {
        const unitPrice = Number(item.product.sellingPrice) || 0;
        const quantity = Number(item.quantity) || 0;
        const itemSubtotal = unitPrice * quantity;
        const itemDiscount = Number(item.discount) || 0;
        const itemSubtotalAfterDiscount = Math.max(0, itemSubtotal - itemDiscount);
        subtotal += itemSubtotalAfterDiscount;
        itemDiscountsTotal += itemDiscount;

        const gstPercent = Number(item.product.gstPercentage) || 0;
        const itemGst = (itemSubtotalAfterDiscount * gstPercent) / 100;
        gstTotal += itemGst;
      }
    });

    const orderDiscountAmount = discounts.reduce((sum, disc) => sum + (Number(disc) || 0), 0);
    const grandTotal = subtotal + gstTotal - orderDiscountAmount;

    return { subtotal, gstTotal, itemDiscountsTotal, grandTotal, orderDiscountAmount };
  };

  const { subtotal, gstTotal, itemDiscountsTotal, grandTotal, orderDiscountAmount } = calculateTotals();

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

      // Validate for expired products and insufficient stock
      let hasExpiredProduct = false;
      let hasInsufficientStock = false;
      const errorMessages: string[] = [];
      const updatedItems = [...items];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let productError = '';
        let quantityError = '';
        
        if (!item.productId || !item.quantity) {
          continue;
        }

        const product = products.find(p => p.id === item.productId);
        
        if (!product) {
          continue;
        }

        // Check if product is expired
        if (product.expiryDate) {
          const expiryDate = new Date(product.expiryDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expiryDate.setHours(0, 0, 0, 0);
          
          if (expiryDate < today) {
            hasExpiredProduct = true;
            productError = `This product has expired on ${new Date(product.expiryDate).toLocaleDateString()}`;
            errorMessages.push(`Item ${i + 1}: Product "${product.name}" has expired on ${new Date(product.expiryDate).toLocaleDateString()}`);
          }
        }

        // Check if quantity exceeds remaining stock (accounting for other items in the form)
        const remainingQuantity = getRemainingQuantity(product, i);
        const requestedQuantity = Number(item.quantity) || 0;
        if (requestedQuantity > remainingQuantity) {
          hasInsufficientStock = true;
          const allocated = calculateAllocatedQuantity(product.id, i);
          const stock = Number(product.stock) || 0;
          quantityError = `Insufficient stock! Available: ${remainingQuantity} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
          errorMessages.push(`Item ${i + 1}: Insufficient stock for "${product.name}". Available: ${remainingQuantity} item(s) (Total stock: ${stock} - Already allocated: ${allocated}), but ${requestedQuantity} requested.`);
        }

        // Update item with errors if any
        if (productError || quantityError) {
          updatedItems[i] = {
            ...item,
            productError,
            quantityError,
          };
        }
      }

      // If there are validation errors, update items with errors and prevent submission
      if (hasExpiredProduct || hasInsufficientStock) {
        setItems(updatedItems);
        const errorMessage = errorMessages.join('\n');
        message.error('Cannot save order. Please fix the following errors:');
        notification.error({
          message: 'Validation Error',
          description: errorMessage,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
          duration: 8,
          placement: 'topRight',
        });
        return;
      }

      setLoading(true);

      // Format data for API
      // For updates, only include customer fields if they were changed
      const discountEntries = discounts.filter(d => d > 0).map(d => ({ amount: d }));
      const baseData: any = {
        paymentType: paymentType,
        items: validItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: item.discount || 0
        }))
      };

      // Only include discounts if there are any non-zero entries
      if (discountEntries.length > 0) {
        baseData.discounts = discountEntries;
      }

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
        // Navigate to main page with success message
        navigate('/billing', { state: { successMessage: t.orderUpdated } });
      } else {
        await createOrder(apiData);
        // Navigate to main page with success message
        navigate('/billing', { state: { successMessage: t.orderCreated } });
      }
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
                    onChange={(e) => { setCustomerName(e.target.value);
                       }}
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                        {t.discountLabel || 'Discount'}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                        {t.itemSubtotal}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
                        {t.actions}
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
                              onChange={(value) => {
                                // Validate on every change immediately - show error if exceeds stock
                                handleQuantityChange(index, value);
                              }}
                              onPressEnter={(e) => {
                                // Also validate on Enter key press
                                const target = e.target as HTMLInputElement;
                                const value = parseFloat(target.value) || null;
                                handleQuantityChange(index, value);
                              }}
                              onBlur={() => {
                                // Revalidate on blur and ensure minimum value
                                const currentItem = items[index];
                                const currentQuantity = Number(currentItem?.quantity) || 0;
                                
                                if (currentItem?.product) {
                                  const remainingQuantity = getRemainingQuantity(currentItem.product, index);
                                  
                                  if (currentQuantity <= 0) {
                                    // Set to 1 if invalid
                                    updateItem(index, { quantity: 1, quantityError: '' });
                                  } else if (currentQuantity > remainingQuantity) {
                                    // Show error if exceeds stock
                                    const allocated = calculateAllocatedQuantity(currentItem.product.id, index);
                                    const stock = Number(currentItem.product.stock) || 0;
                                    const quantityError = `Insufficient stock! Available: ${remainingQuantity} item(s) (Total stock: ${stock} - Already allocated: ${allocated})`;
                                    updateItem(index, { quantityError });
                                  } else if (currentItem.quantityError && currentQuantity <= remainingQuantity) {
                                    // Clear error if quantity is now valid
                                    updateItem(index, { quantityError: '' });
                                  }
                                } else if (currentQuantity <= 0) {
                                  // No product selected but quantity is invalid
                                  updateItem(index, { quantity: 1, quantityError: '' });
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
                        <td className="px-4 py-3 align-top">
                          <Form.Item style={{ marginBottom: 0 }}>
                            <InputNumber
                              placeholder={t.discountPlaceholder || 'Discount'}
                              style={{ width: '100%' }}
                              size="large"
                              min={0}
                              formatter={(value) => value !== undefined && value !== null ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                              parser={(value) => {
                                const cleaned = value?.replace(/₹\s?|(,*)/g, '') || '';
                                return cleaned ? parseFloat(cleaned) : 0;
                              }}
                              value={item.discount || 0}
                              onChange={(value) => handleDiscountChange(index, value)}
                            />
                          </Form.Item>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {item.product ? (
                            <span className="text-sm font-semibold text-[var(--text-primary)]">
                              ₹{Math.max(0, (Number(item.product.sellingPrice) * Number(item.quantity)) - (Number(item.discount) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--text-secondary)]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Space>
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
                          </Space>
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
