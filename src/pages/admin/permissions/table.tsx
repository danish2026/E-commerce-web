import React, { useState } from 'react';
import { message } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Permission, deletePermission } from './api';

dayjs.extend(advancedFormat);

interface TableProps {
  data: Permission[];
  loading?: boolean;
  onNavigate?: (path: string, data?: any) => void;
  onDelete?: () => void;
  pagination?: TablePaginationConfig;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const formatDate = (value?: string) => {
  if (!value) return '-';
  try {
    return dayjs(value).format('MMM Do, YYYY; hh:mm A');
  } catch {
    return '-';
  }
};

const PermissionTable: React.FC<TableProps> = ({
  data,
  loading = false,
  onNavigate,
  onDelete,
  pagination,
}) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
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

  const handleDelete = (permission: Permission) => {
    if (!permission?.id) {
      message.error('Invalid permission ID');
      return;
    }
    setPermissionToDelete(permission);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!permissionToDelete?.id) {
      message.error('Invalid permission ID');
      return;
    }

    try {
      setIsDeleting(true);
      await deletePermission(permissionToDelete.id);
      message.success('Permission deleted successfully');
      setDeleteModalVisible(false);
      setPermissionToDelete(null);
      onDelete?.();
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete permission';
      message.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setPermissionToDelete(null);
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
    if (!deleteModalVisible || !permissionToDelete) return null;

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
                  Delete Permission
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Are you sure you want to delete this permission?
                </p>
              </div>
            </div>
            <div className="mb-6 p-4 bg-[var(--surface-2)] rounded-lg">
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {permissionToDelete.module.charAt(0).toUpperCase() + permissionToDelete.module.slice(1)} - {permissionToDelete.action.charAt(0).toUpperCase() + permissionToDelete.action.slice(1)}
              </p>
              {permissionToDelete.description && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {permissionToDelete.description}
                </p>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              This action cannot be undone. The permission will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-border)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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

  if (isMobile) {
    return (
      <>
        {renderDeleteModal()}
        <div className="bg-[var(--surface-1)] rounded-lg shadow-sm border border-[var(--glass-border)] overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-[var(--text-secondary)]">Loading permissions...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
              No permissions found. Click Create Permission to create one.
            </div>
          ) : (
            <div className="space-y-0">
              {data.map((permission) => (
                <div
                  key={permission.id}
                  className="px-4 py-4 border-b border-[var(--glass-border)] last:border-b-0 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                        {permission.module.charAt(0).toUpperCase() + permission.module.slice(1)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {formatDate(permission.createdAt)}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-md bg-surface-2 text-text-secondary font-medium">
                      {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                    {permission.description && (
                      <div>
                        <span className="text-[var(--text-primary)]">{permission.description}</span>
                      </div>
                    )}
                    <div className="text-xs">
                      Updated: {formatDate(permission.updatedAt)}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button
                      onClick={() => onNavigate?.('view', permission)}
                      className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      title="View"
                      aria-label="View"
                    >
                      <EyeOutlined className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => onNavigate?.('form', { ...permission, mode: 'edit' })}
                      className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <EditOutlined className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(permission)}
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
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Module</span>
                  </div>
                </th>
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Action</span>
                  </div>
                </th>
                <th className="px-[18px] py-6 text-left h-[64px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Description</span>
                  </div>
                </th>
                {!isTablet && (
                  <th className="px-[18px] py-6 text-left h-[64px]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">Created At</span>
                    </div>
                  </th>
                )}
                <th className="px-[18px] py-6 text-left pl-[100px] h-[64px]">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-[18px] py-12 text-center text-[var(--text-secondary)] text-sm">
                    Loading permissions...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-[18px] py-12 text-center text-[var(--text-secondary)] text-sm">
                    No permissions found. Click Create Permission to create one.
                  </td>
                </tr>
              ) : (
                data.map((permission) => (
                  <tr
                    key={permission.id}
                    className="hover:-translate-y-0.5 transition-all duration-200 bg-[var(--surface-1)] border-b border-[var(--glass-border)] hover:bg-[var(--surface-2)] group"
                  >
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {permission.module.charAt(0).toUpperCase() + permission.module.slice(1)}
                      </div>
                    </td>
                    <td className="px-[18px] py-4 h-[56px]">
                      <span className="px-2 py-1 rounded-md bg-surface-2 text-text-secondary text-xs font-medium">
                        {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}
                      </span>
                    </td>
                    <td className="px-[18px] py-4 h-[56px]">
                      <div className="text-sm text-[var(--text-secondary)]">
                        {permission.description || '-'}
                      </div>
                    </td>
                    {!isTablet && (
                      <td className="px-[18px] py-4 h-[56px]">
                        <div className="text-sm text-[var(--text-secondary)]">
                          {formatDate(permission.createdAt)}
                        </div>
                      </td>
                    )}
                    <td className="px-[18px] py-4 h-[56px] text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate?.('view', permission)}
                          className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                          title="View"
                          aria-label="View"
                        >
                          <EyeOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                        </button>
                        <button
                          onClick={() => onNavigate?.('form', { ...permission, mode: 'edit' })}
                          className="p-2 rounded hover:bg-[var(--glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <EditOutlined className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
                        </button>
                        <button
                          onClick={() => handleDelete(permission)}
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

export default PermissionTable;

