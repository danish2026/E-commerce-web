import React, { useState } from 'react';
import { Tag, Button, Space, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { deletePurchase, getApiErrorMessage } from './PurcherseService';
import { usePurchaseTranslation } from '../../../hooks/usePurchaseTranslation';

dayjs.extend(advancedFormat);

interface Purchase {
  id: string;
  supplier: string;
  buyer: string;
  quantity: string;
  payment: string;
  dueDate: string;
  gst: string;
  amount: string;
  totalAmount: string;
  
}

interface TableProps {
  onNavigate: (path: string, data?: any) => void;
  purchases: Purchase[];
  onDelete?: () => void;
  pagination?: TablePaginationConfig;
}

const PAGE_SIZE_OPTIONS = [5,10, 20, 50];

const Table = ({ onNavigate, purchases, onDelete, pagination }: TableProps) => {
  const { t } = usePurchaseTranslation();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Purchase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return dayjs(dateString).format('MMM Do, YYYY');
    } catch {
      return '-';
    }
  };

  const translatePaymentStatus = (payment: string): string => {
    const paymentLower = payment.toLowerCase();
    if (paymentLower === 'paid' || payment === t.paid) return t.paid;
    if (paymentLower === 'pending' || payment === t.pending) return t.pending;
    if (paymentLower === 'partial' || payment === t.partial) return t.partial;
    if (paymentLower === 'overdue' || payment === t.overdue) return t.overdue;
    return payment;
  };

  const getPaymentTag = (payment: string) => {
    const translatedPayment = translatePaymentStatus(payment);
    const colorMap: Record<string, string> = {
      [t.paid]: 'success',
      [t.pending]: 'warning',
      [t.partial]: 'processing',
      [t.overdue]: 'error',
      // Fallback for English values
      'Paid': 'success',
      'Pending': 'warning',
      'Partial': 'processing',
      'Overdue': 'error',
    };
    return <Tag color={colorMap[translatedPayment] || colorMap[payment] || 'default'}>{translatedPayment}</Tag>;
  };

  const handleDelete = (record: Purchase) => {
    if (!record.id) {
      message.error('Invalid purchase ID');
      return;
    }
    setItemToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !itemToDelete.id) {
      message.error('Invalid purchase ID');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Deleting purchase with ID:', itemToDelete.id);
      await deletePurchase(itemToDelete.id);
      message.success(t.purchaseDeleted);
      setDeleteModalVisible(false);
      setItemToDelete(null);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      const errorMessage = getApiErrorMessage(error, t.failedToDelete);
      message.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const currentPage = pagination?.current || 1;
  const pageSize = pagination?.pageSize || 10;
  const total = pagination?.total || purchases.length;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const totalPages = Math.ceil(total / pageSize);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getDesktopPageNumbers = () =>
    Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1);

  const renderDeleteModal = () => {
    if (!deleteModalVisible || !itemToDelete) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70"
        onClick={handleCancelDelete}
      >
        <div 
          className="bg-[var(--surface-1)] rounded-lg shadow-xl max-w-md w-full mx-4 border border-[var(--glass-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ExclamationCircleOutlined className="text-red-600 dark:text-red-400 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {t.deletePurchaseTitle}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {t.deletePurchaseConfirm}
                </p>
              </div>
            </div>
            <div className="mb-6 p-4 bg-[var(--surface-2)] rounded-lg">
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {t.supplier}: {itemToDelete.supplier}
              </p>
              {itemToDelete.buyer && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {t.buyer}: {itemToDelete.buyer}
                </p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                <span>{t.amount}: ₹{itemToDelete.amount}</span>
                <span>{t.quantity}: {itemToDelete.quantity}</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {t.deletePurchaseWarning}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-border)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
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

  if (isMobile) {
    return (
      <>
        {renderDeleteModal()}
        <div className="bg-[var(--surface-1)] rounded-lg shadow-sm border border-[var(--glass-border)] overflow-hidden">
        <div className="space-y-0">
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
              {t.noPurchasesFound}
            </div>
          ) : (
            purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="px-4 py-4 border-b border-[var(--glass-border)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[var(--glass-border)] text-brand focus:ring-brand focus:ring-2"
                      checked={selectedRows.has(purchase.id)}
                      onChange={(e) => handleSelectRow(purchase.id, e.target.checked)}
                    />
                    <div className="flex flex-col">
                      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate flex-1">
                        {purchase.supplier}
                      </h3>
                      <span className="text-xs text-[var(--text-secondary)]">{purchase.buyer}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => onNavigate('view', purchase)}
                      className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      title="View"
                      aria-label="View"
                    >
                      <EyeOutlined className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => onNavigate('form', { ...purchase, mode: 'edit' })}
                      className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <EditOutlined className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(purchase)}
                      className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <DeleteOutlined className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
                  <div className="ml-7 space-y-2 text-xs text-[var(--text-secondary)]">
                  <div>{t.gst}: {purchase.gst || '-'}</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>{t.amount}: ₹{purchase.amount}</span>
                    <span>{t.quantity}: {purchase.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPaymentTag(purchase.payment)}
                    <span className="font-semibold text-[var(--text-primary)]">
                      {t.dueDate} {formatDate(purchase.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.supplier}</span>
                </div>
              </th>
              {!isTablet && (
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{t.buyer}</span>
                  </div>
                </th>
              )}
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.gst}</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.amount}</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.quantity}</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.payment}</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.dueDate}</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{t.totalAmount}</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left pl-[100px] h-[64px]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t.actions}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-[18px] py-12 text-center text-[var(--text-secondary)] text-sm">
                  {t.noPurchasesFound}
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="hover:-translate-y-0.5 transition-all duration-200 bg-[var(--surface-1)] border-b border-[var(--glass-border)] hover:bg-[var(--surface-2)] group"
                >
                  <td className="px-[18px] py-4 h-[56px]">
                    <div className="text-[15px] font-semibold text-[var(--text-primary)] truncate max-w-[220px]" title={purchase.supplier}>
                      {purchase.supplier}
                    </div>
                  </td>
                  {!isTablet && (
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm text-[var(--text-primary)] truncate max-w-[200px]" title={purchase.buyer}>
                        {purchase.buyer}
                      </div>
                    </td>
                  )}
                  <td className="px-[18px] py-4 h-[56px]">
                    <div className="text-sm text-[var(--text-primary)]">{purchase.gst}</div>
                  </td>
                  <td className="px-[18px] py-4 h-[56px]">
                    <div className="text-sm text-[var(--text-primary)]">₹{purchase.amount}</div>
                  </td>
                  <td className="px-[18px] py-4 h-[56px]">
                    <div className="text-sm text-[var(--text-primary)]">{purchase.quantity}</div>
                  </td>
                  <td className="px-[18px] py-4 h-[56px]">
                    {getPaymentTag(purchase.payment)}
                  </td>
                  <td className="px-[18px] py-4 h-[56px]">
                    <div className="text-sm text-[var(--text-primary)]">{formatDate(purchase.dueDate)}</div>
                  </td>
                  <td className="px-[18px] py-4 h-[56px]">
                    <div className="text-sm text-[var(--text-primary)]">₹{purchase.totalAmount}</div>
                  </td>
                  <td className="px-[18px] py-4 h-[56px] text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onNavigate('view', purchase)}
                        className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                        title="View"
                        aria-label="View"
                      >
                        <EyeOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                      </button>
                      <button
                        onClick={() => onNavigate('form', { ...purchase, mode: 'edit' })}
                        className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <EditOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                      </button>
                      <button
                        onClick={() => handleDelete(purchase)}
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

export default Table;
