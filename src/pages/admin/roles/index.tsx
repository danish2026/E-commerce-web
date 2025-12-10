import { Space, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PlusOutlined } from '@ant-design/icons';
import { useRoleTranslation } from '../../../hooks/useRoleTranslation';
import { fetchRoles, Role } from './api';
import Table from './table';

const Roles = () => {
  const navigate = useNavigate();
  const { t, translate } = useRoleTranslation();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter roles based on search text
  const filteredRoles = React.useMemo(() => {
    if (!searchText.trim()) {
      return roles;
    }
    const searchLower = searchText.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchLower) ||
        (role.description && role.description.toLowerCase().includes(searchLower))
    );
  }, [roles, searchText]);

  // Paginate filtered roles
  const paginatedRoles = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, currentPage, pageSize]);

  // Update total when filtered roles change
  useEffect(() => {
    setTotal(filteredRoles.length);
    // Reset to page 1 if current page is out of bounds
    const maxPage = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [filteredRoles.length, pageSize, currentPage]);

  // Load roles
  const loadRoles = async () => {
    try {
      setLoading(true);
      const fetchedRoles = await fetchRoles();
      setRoles(fetchedRoles);
    } catch (error: any) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/roles/form', { state: data });
    } else if (path === 'view') {
      navigate('/roles/view', { state: data });
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen gap-[30px] bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <Space size="middle" className="w-full" wrap>
              <Input
                placeholder={t.searchPlaceholder}
                style={{ width: 550, height: '40px' }}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleNavigate('form', { mode: 'add' })}
                style={{
                  height: '40px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                {t.addRole}
              </Button>
            </Space>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            data={paginatedRoles}
            loading={loading}
            onNavigate={handleNavigate}
            onDelete={loadRoles}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total: number) => translate('totalRoles', { count: total }),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Roles;

