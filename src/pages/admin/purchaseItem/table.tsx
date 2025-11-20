import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { deletePurchaseItem, getApiErrorMessage } from './PurchaseItemService';

dayjs.extend(advancedFormat);

interface PurchaseItem {
  id: string;
  item: string;
  description?: string;
  quantity: string;
  price: string;
  total: string;
  createdAt?: string;
}

interface TableProps {
  onNavigate: (path: string, data?: any) => void;
  purchaseItems: PurchaseItem[];
  onDelete?: () => void;
  pagination?: TablePaginationConfig;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return dayjs(dateString).format('MMM Do, YYYY; hh:mm A');
  } catch {
    return '-';
  }
};

const formatCurrency = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '0';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0';
  return numValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const Table = ({ onNavigate, purchaseItems, onDelete, pagination }: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = (record: PurchaseItem) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this purchase item?',
      content: `This will permanently delete the purchase item: ${record.item}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deletePurchaseItem(record.id);
          message.success('Purchase item deleted successfully!');
          if (onDelete) {
            onDelete();
          }
        } catch (error) {
          console.error('Error deleting purchase item:', error);
          message.error(getApiErrorMessage(error, 'Failed to delete purchase item'));
        }
      },
    });
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
  const total = pagination?.total || purchaseItems.length;
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
      <div className="px-4 py-4 border-t border-[#e6eef2] bg-gray-50">
        <div className="flex flex-col lg:flex-row justify-end items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
          <div className="text-xs gap-[10px] text-[#6b7280]">
            Showing {start} to {end} of {total} 
          </div>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-2 py-1 rounded border border-gray-300 text-[#0f1724] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
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
              className="px-3 py-1.5 rounded border border-gray-300 text-sm text-[#0f1724] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
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
                      : 'border border-gray-300 text-[#0f1724] hover:bg-gray-100'
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
              className="px-3 py-1.5 rounded border border-gray-300 text-sm text-[#0f1724] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
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
      <div className="bg-white rounded-lg shadow-sm border border-[#e6eef2] overflow-hidden">
        <div className="space-y-0">
          {purchaseItems.length === 0 ? (
            <div className="text-center py-12 text-[#6b7280] text-sm">
              No purchase items found. Click Add Purchase Item to create one.
            </div>
          ) : (
            purchaseItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className="px-4 py-4 border-b border-[#eef2f5] last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand focus:ring-2"
                        checked={selectedRows.has(item.id)}
                        onChange={(e) => handleSelectRow(item.id, e.target.checked)}
                      />
                      <h3 className="text-[15px] font-semibold text-[#0f1724] truncate flex-1">
                        {item.item}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => onNavigate('form', { ...item, mode: 'edit' })}
                        className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <EditOutlined className="w-4 h-4 text-[#6b7280]" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <DeleteOutlined className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="ml-7 space-y-2 text-xs text-[#6b7280]">
                    {item.createdAt && (
                      <div>{formatDate(item.createdAt)}</div>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ₹{formatCurrency(item.price)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0f1724]">Total: ₹{formatCurrency(item.total)}</span>
                    </div>
                    {item.description && (
                      <div className="text-xs text-[#6b7280] truncate">{item.description}</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {renderPagination(getPageNumbers())}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#e6eef2] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[#e6eef2]">
            <tr>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#0f1724]">Item Name</span>
                </div>
              </th>
              {!isTablet && (
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#0f1724]">Date Created</span>
                  </div>
                </th>
              )}
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#0f1724]">Quantity</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#0f1724]">Price</span>
                </div>
              </th>
              <th className="px-[18px] py-6 text-left h-[64px]">
                <span className="text-sm font-semibold text-[#0f1724]">Total</span>
              </th>
              <th className="px-[18px] py-6 text-left pl-[100px] h-[64px]">
                <span className="text-sm font-semibold text-[#0f1724]">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {purchaseItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-[18px] py-12 text-center text-[#6b7280] text-sm">
                  No purchase items found. Click Add Purchase Item to create one.
                </td>
              </tr>
            ) : (
              purchaseItems.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className="hover:-translate-y-0.5 transition-all duration-200 bg-white border-b border-[#eef2f5] hover:bg-gray-50 group"
                  >
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-[15px] font-semibold text-[#0f1724] truncate max-w-[220px]" title={item.item}>
                        {item.item}
                      </div>
                    </td>
                    {!isTablet && (
                      <td className="px-[18px] py-4 h-[56px]">
                        <div className="text-xs text-[#6b7280]">{formatDate(item.createdAt)}</div>
                      </td>
                    )}
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm text-[#0f1724]">{item.quantity}</div>
                    </td>
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm text-[#0f1724]">₹{formatCurrency(item.price)}</div>
                    </td>
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm font-semibold text-[#0f1724]">₹{formatCurrency(item.total)}</div>
                    </td>
                    <td className="px-[18px] py-4 h-[56px] text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate('view', item)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                          title="View"
                          aria-label="View"
                        >
                          <EyeOutlined className="w-4 h-4 text-[#6b7280] group-hover:text-[#0f1724]" />
                        </button>
                        <button
                          onClick={() => onNavigate('form', { ...item, mode: 'edit' })}
                          className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <EditOutlined className="w-4 h-4 text-[#6b7280] group-hover:text-[#0f1724]" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 rounded hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <DeleteOutlined className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {renderPagination(getDesktopPageNumbers())}
    </div>
  );
};

export default Table;

