import { Button, DatePicker, Input, Space, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { fetchEmployees, Employee } from './api';
import Table from './table';
import { usePermissions } from '../../../hooks/usePermissions';

const Employees = () => {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const { canCreate, canView, canEdit, canDelete, hasModuleAccess, loading: permissionsLoading } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Permission checks for employees module
  const moduleName = 'employees';
  const canCreateEmployee = canCreate(moduleName);
  const canViewEmployee = canView(moduleName);
  const canEditEmployee = canEdit(moduleName);
  const canDeleteEmployee = canDelete(moduleName);
  const hasAccess = hasModuleAccess(moduleName);

  // Load employees with server-side pagination and filtering
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const fromDate = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
      const toDate = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;
      
      const response = await fetchEmployees(
        currentPage,
        pageSize,
        searchText || undefined,
        fromDate,
        toDate
      );
      
      setEmployees(response.data);
      setTotal(response.meta.total);
    } catch (error: any) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [currentPage, pageSize, searchText, dateRange]);

  const handleNavigate = (path: string, data?: any) => {
    if (path === 'form') {
      navigate('/employees/form', { state: data });
    } else if (path === 'view') {
      navigate('/employees/view', { state: data });
    }
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page when page size changes
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
                placeholder="Search by name, email, or phone"
                style={{ width: 600, height: '40px' }}
                allowClear
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                onPressEnter={() => {
                  setCurrentPage(1);
                  loadEmployees();
                }}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
                  setCurrentPage(1);
                }}
                format="YYYY-MM-DD"
                placeholder={['Start Date', 'End Date']}
                style={{ width: 200, height: '40px' }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/employees/form')}
                size="large"
                disabled={!canCreateEmployee}
                title={!canCreateEmployee ? 'You do not have permission to create employees' : ''}
                style={{
                  height: '40px',
                  width: '200px',
                  backgroundColor: 'var(--brand)',
                  borderColor: 'var(--brand)',
                }}
              >
                Add Employee
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
            data={employees}
            loading={loading}
            onNavigate={handleNavigate}
            onDelete={loadEmployees}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              onShowSizeChange: handlePageSizeChange,
              showSizeChanger: true,
              showTotal: (total: number) => `Total ${total} employees`,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Employees;
