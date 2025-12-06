import React, { useState } from 'react';
import { message } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useBillingTranslation } from '../../../hooks/useBillingTranslation';
import { Order, deleteOrder, PaymentType } from './api';

dayjs.extend(advancedFormat);

interface TableProps {
  data: Order[];
  loading?: boolean;
  onNavigate?: (path: string, data?: any) => void;
  onDelete?: () => void;
  pagination?: TablePaginationConfig;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const formatCurrency = (value: number | string | undefined | null) => {
  if (value === undefined || value === null || value === '') return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) {
    return '0.00';
  }
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  try {
    return dayjs(value).format('MMM Do, YYYY; hh:mm A');
  } catch {
    return '-';
  }
};

const getPaymentBadgeClasses = (paymentType?: PaymentType) => {
  switch (paymentType) {
    case PaymentType.CASH:
      return 'bg-[rgb(3_78_30)] text-green-900 dark:bg-blue dark:text-green-300';

    case PaymentType.CARD:
      return 'bg-[rgb(98 17 183)] text-blue-700 dark:bg-blue-900/20 dark:text-blue-1000';
    case PaymentType.UPI:
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-1000';
    case PaymentType.CREDIT:
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-1000';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-1000';
  }
};

const OrderTable: React.FC<TableProps> = ({
  data,
  loading = false,
  onNavigate,
  onDelete,
  pagination,
}) => {
  const { t, translate } = useBillingTranslation();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false,
  );
  const [isTablet, setIsTablet] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1024 : false,
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const translatePaymentType = (paymentType?: PaymentType) => {
    if (!paymentType) return 'N/A';
    switch (paymentType) {
      case PaymentType.CASH:
        return t.cash;
      case PaymentType.CARD:
        return t.card;
      case PaymentType.UPI:
        return t.upi;
      case PaymentType.CREDIT:
        return t.credit;
      default:
        return paymentType;
    }
  };

  const handleDelete = (order: Order) => {
    if (!order?.id) {
      message.error(t.failedToDelete);
      return;
    }
    setOrderToDelete(order);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete?.id) {
      message.error(t.failedToDelete);
      return;
    }

    try {
      setIsDeleting(true);
      await deleteOrder(orderToDelete.id);
      message.success(t.orderDeleted);
      setDeleteModalVisible(false);
      setOrderToDelete(null);
      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      const errorMessage = error?.response?.data?.message || error?.message || t.failedToDelete;
      message.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setOrderToDelete(null);
  };

  const total = pagination?.total ?? 0;
  const currentPage = pagination?.current ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const start = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = total > 0 ? Math.min(currentPage * pageSize, total) : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  const getDesktopPageNumbers = () =>
    Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1);

  const renderPagination = (pages: number[]) => {
    if (!pagination || total <= 0) return null;

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(event.target.value);
      if (!pagination) return;
      const nextPage = 1;
      pagination.onShowSizeChange?.(nextPage, newSize);
      if (!pagination.onShowSizeChange) {
        pagination.onChange?.(nextPage, newSize);
      }
    };

    return (
      <div className="px-4 py-4 border-t border-[var(--glass-border)] bg-[var(--surface-2)]">
        <div className="flex flex-col lg:flex-row justify-end items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <div className="text-xs gap-[10px] text-[var(--text-secondary)]">
              Showing {start} to {end} of {total}
            </div>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-2 py-1 rounded border border-[var(--glass-border)] text-[var(--text-primary)] text-sm bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
              aria-label="page"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
  onClick={() => pagination.onChange?.(currentPage - 1, pageSize)}
  disabled={currentPage === 1}
  className="px-3 py-1.5 rounded border border-[var(--glass-border)] text-[24px] text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
  aria-label="Previous page"
>

              ‹
            </button>
            {pages.map((page) => {
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => pagination.onChange?.(page, pageSize)}
                  className={`px-3 py-1.5 rounded text-sm min-w-[36px] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 ${
                    isCurrent
                      ? 'bg-brand text-white font-semibold'
                      : 'border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => pagination.onChange?.(currentPage + 1, pageSize)}
              disabled={currentPage >= totalPages}
  className="px-3 py-1.5 rounded border border-[var(--glass-border)] text-[24px] text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => {
    if (!deleteModalVisible || !orderToDelete) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
        onClick={cancelDelete}
      >
        <div
          className="bg-[var(--surface-1)] rounded-lg shadow-xl max-w-md w-full mx-4 border border-[var(--glass-border)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {t.deleteOrderTitle}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {t.deleteOrderConfirm}
                </p>
              </div>
            </div>
            <div className="mb-6 p-4 bg-[var(--surface-2)] rounded-lg">
                <p className="text-sm text-[var(--text-primary)] font-medium">
                  {t.order} #{orderToDelete.orderNumber || orderToDelete.id?.substring(0, 8).toUpperCase().replace(/-/g, '') || 'N/A'}
                </p>
              {orderToDelete.customerName && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {t.customer}: {orderToDelete.customerName}
                </p>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {t.deleteOrderWarning}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-border)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 dark:bg-red-700 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? t.deleting : t.delete}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <>
        {renderDeleteModal()}
        <div className="bg-[var(--surface-1)] rounded-lg shadow-sm border border-[var(--glass-border)] overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-[var(--text-secondary)]">{t.loadingOrders}</div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
              {t.noOrdersFound}
            </div>
          ) : (
            <div className="space-y-0">
              {data.map((order) => (
                <div
                  key={order.id}
                  className="px-4 py-4 border-b border-[var(--glass-border)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                        Order #{order.orderNumber || order.id?.substring(0, 8).toUpperCase().replace(/-/g, '') || 'N/A'}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${getPaymentBadgeClasses(
                        order.paymentType,
                      )}`}
                    >
                      {translatePaymentType(order.paymentType)}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                    <div>
                      {t.customer}:{' '}
                      <span className="text-[var(--text-primary)] font-medium">
                        {order.customerName || t.walkInCustomer}
                      </span>
                    </div>
                    {order.customerPhone && <div>{t.customerPhone}: {order.customerPhone}</div>}
                    <div className="flex items-center gap-2">
                      <span>{t.subtotal}: ₹{formatCurrency(order.subtotal)}</span>
                      <span>|</span>
                      <span>{t.gst}: ₹{formatCurrency(order.gstTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">
                        {t.discount}: {Number(order.discount) > 0 ? `- ₹${formatCurrency(order.discount)}` : '-'}
                      </span>
                      <span>|</span>
                      <span className="text-[var(--text-primary)] font-semibold">
                        {t.grandTotal}: ₹{formatCurrency(order.grandTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      onClick={() => onNavigate?.('view', order)}
                      className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      title="View"
                      aria-label="View"
                    >
                      <EyeOutlined className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => onNavigate?.('form', { ...order, mode: 'edit' })}
                      className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <EditOutlined className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <DeleteOutlined className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {renderPagination(getPageNumbers())}
        </div>
      </>
    );
  }

  return (
    <>
      {renderDeleteModal()}
      <div className="bg-[var(--surface-1)] rounded-lg shadow-sm border border-[var(--glass-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--glass-border)]">
              <tr>
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{t.order}</span>
                  </div>
                </th>
                {!isTablet && (
                  <th className="px-[18px] py-6 text-left h-[64px]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{t.customer}</span>
                    </div>
                  </th>
                )}
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{t.subtotal}</span>
                  </div>
                </th>
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{t.gst}</span>
                  </div>
                </th>
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.discount}</span>
                </th>
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.grandTotal}</span>
                </th>
                {!isTablet && (
                  <th className="px-[18px] py-6 text-left h-[64px]">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{t.payment}</span>
                  </th>
                )}
                <th className="px-[18px] py-6 text-left pl-[100px] h-[64px]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-[18px] py-12 text-center text-[var(--text-secondary)] text-sm">
                    {t.loadingOrders}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-[18px] py-12 text-center text-[var(--text-secondary)] text-sm">
                    {t.noOrdersFound}
                  </td>
                </tr>
              ) : (
                data.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:-translate-y-0.5 transition-all duration-200 bg-[var(--surface-1)] border-b border-[var(--glass-border)] hover:bg-[var(--surface-2)] group"
                  >
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                          #{order.orderNumber || order.id?.substring(0, 8).toUpperCase().replace(/-/g, '') || 'N/A'}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)] mt-1">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </td>
                    {!isTablet && (
                      <td className="px-[18px] py-4 h-[56px]">
                        <div className="text-sm text-[var(--text-primary)]">
                          {order.customerName || t.walkInCustomer}
                        </div>
                        {order.customerPhone && (
                          <div className="text-xs text-[var(--text-secondary)] mt-1">{order.customerPhone}</div>
                        )}
                      </td>
                    )}
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm text-[var(--text-primary)]">₹{formatCurrency(order.subtotal)}</div>
                    </td>
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm text-[var(--text-primary)]">₹{formatCurrency(order.gstTotal)}</div>
                    </td>
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm text-red-500">
                        {Number(order.discount) > 0 ? `- ₹${formatCurrency(order.discount)}` : '-'}
                      </div>
                    </td>
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        ₹{formatCurrency(order.grandTotal)}
                      </div>
                    </td>
                    {!isTablet && (
                      <td className="px-[18px] py-4 h-[56px]">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${getPaymentBadgeClasses(
                            order.paymentType,
                          )}`}
                        >
                          {translatePaymentType(order.paymentType)}
                        </span>
                      </td>
                    )}
                    <td className="px-[18px] py-4 h-[56px] text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate?.('view', order)}
                          className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                          title="View"
                          aria-label="View"
                        >
                          <EyeOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                        </button>
                        <button
                          onClick={() => onNavigate?.('form', { ...order, mode: 'edit' })}
                          className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <EditOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                        </button>
                        <button
                          onClick={() => handleDelete(order)}
                          className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <DeleteOutlined className="w-4 h-4 text-red-500 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {renderPagination(getDesktopPageNumbers())}
      </div>
    </>
  );
};

export default OrderTable;
