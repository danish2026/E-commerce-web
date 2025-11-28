import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

export interface TableColumn<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T) => React.ReactNode;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => Promise<void>;
  onDeleteSuccess?: () => void;
  pagination?: TablePaginationConfig;
  emptyMessage?: string;
  getRowId: (record: T) => string;
  deleteConfirmMessage?: (record: T) => string;
  deleteTitle?: string;
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

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  onDeleteSuccess,
  pagination,
  emptyMessage = 'No data found.',
  getRowId,
  deleteConfirmMessage,
  deleteTitle = 'Delete Item',
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 640 : false);
  const [isTablet, setIsTablet] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = (record: T) => {
    if (!getRowId(record)) {
      message.error('Invalid item ID');
      return;
    }
    setItemToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !onDelete) {
      message.error('Invalid item or delete function');
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(itemToDelete);
      message.success('Item deleted successfully!');
      setDeleteModalVisible(false);
      setItemToDelete(null);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Failed to delete item');
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
  const total = pagination?.total || data.length;
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
              className="px-2 py-1 rounded border bor der-[var(--glass-border)] text-[var(--text-primary)] text-sm bg-[var(--surface-1)] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
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
              className="px-3 py-1.5 rounded border border-[var(--glass-border)] text-sm text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
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
              className="px-3 py-1.5 rounded border border-[var(--glass-border)] text-sm text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
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
    if (!deleteModalVisible || !itemToDelete) return null;

    const itemName = itemToDelete.name || itemToDelete.title || 'this item';
    const confirmMessage = deleteConfirmMessage 
      ? deleteConfirmMessage(itemToDelete)
      : `Are you sure you want to delete ${itemName}?`;

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
                  {deleteTitle}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {confirmMessage}
                </p>
              </div>
            </div>
            <div className="mb-6 p-4 bg-[var(--surface-2)] rounded-lg">
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {itemName}
              </p>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              This action cannot be undone. The item will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-border)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 dark:bg-red-700 text-sm font-medium text-white hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter columns based on screen size
  const visibleColumns = columns.filter(
    (col) => !(isMobile && col.hideOnMobile) && !(isTablet && col.hideOnTablet)
  );

  if (isMobile) {
    return (
      <>
        {renderDeleteModal()}
        <div className="bg-[var(--surface-1)] rounded-lg shadow-sm border border-[var(--glass-border)] overflow-hidden">
          <div className="space-y-0">
            {data.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
                {emptyMessage}
              </div>
            ) : (
              data.map((item) => {
                const id = getRowId(item);
                const primaryColumn = columns[0];
                const primaryValue = primaryColumn.render
                  ? primaryColumn.render(item[primaryColumn.dataIndex as string], item)
                  : item[primaryColumn.dataIndex as string];

                return (
                  <div
                    key={id}
                    className="px-4 py-4 border-b border-[var(--glass-border)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-[var(--glass-border)] text-brand focus:ring-brand focus:ring-2"
                          checked={selectedRows.has(id)}
                          onChange={(e) => handleSelectRow(id, e.target.checked)}
                        />
                        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] truncate flex-1">
                          {primaryValue}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <EditOutlined className="w-4 h-4 text-[var(--text-secondary)]" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <DeleteOutlined className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="ml-7 space-y-2 text-xs text-[var(--text-secondary)]">
                      {visibleColumns.slice(1).map((col) => {
                        const value = col.render
                          ? col.render(item[col.dataIndex as string], item)
                          : item[col.dataIndex as string];
                        return (
                          <div key={col.key}>
                            <span className="font-medium">{col.title}:</span> {value || '-'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {renderPagination(getPageNumbers())}
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
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-[18px] py-6 text-left h-[64px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {col.title}
                      </span>
                    </div>
                  </th>
                ))}
                {(onView || onEdit || onDelete) && (
                  <th className="px-[18px] py-6 text-left pl-[100px] h-[64px]">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (onView || onEdit || onDelete ? 1 : 0)}
                    className="px-[18px] py-12 text-center text-[var(--text-secondary)] text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const id = getRowId(item);
                  return (
                    <tr
                      key={id}
                      className="hover:-translate-y-0.5 transition-all duration-200 bg-[var(--surface-1)] border-b border-[var(--glass-border)] hover:bg-[var(--surface-2)] group"
                    >
                      {visibleColumns.map((col) => {
                        const value = col.render
                          ? col.render(item[col.dataIndex as string], item)
                          : item[col.dataIndex as string];
                        return (
                          <td key={col.key} className="px-[18px] py-4 h-[56px]">
                            <div className="text-sm text-[var(--text-primary)]">
                              {value || '-'}
                            </div>
                          </td>
                        );
                      })}
                      {(onView || onEdit || onDelete) && (
                        <td className="px-[18px] py-4 h-[56px] text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onView && (
                              <button
                                onClick={() => onView(item)}
                                className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                                title="View"
                                aria-label="View"
                              >
                                <EyeOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                              </button>
                            )}
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                                title="Edit"
                                aria-label="Edit"
                              >
                                <EditOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                title="Delete"
                                aria-label="Delete"
                              >
                                <DeleteOutlined className="w-4 h-4 text-red-500 dark:text-red-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {renderPagination(getDesktopPageNumbers())}
      </div>
    </>
  );
}

