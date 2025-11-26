import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, DatePicker, Button, Space, message, Spin } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { DataTable, TableColumn } from '../../../components/common/DataTable';
import { ViewModal, ViewField, createDateField, createTextField } from '../../../components/common/ViewModal';
import { getEmployees, deleteEmployee, getEmployeeById, getApiErrorMessage } from './EmployeeService';
import { usePermissions } from '../../../hooks/usePermissions';

const { RangePicker } = DatePicker;

interface EmployeeDisplay {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Employees = () => {
  const navigate = useNavigate();
  const { canCreate, canView, canEdit, canDelete, hasModuleAccess, loading: permissionsLoading } = usePermissions();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [employees, setEmployees] = useState<EmployeeDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeDisplay | null>(null);

  // Permission checks for employees module
  const moduleName = 'employees';
  const canCreateEmployee = canCreate(moduleName);
  const canViewEmployee = canView(moduleName);
  const canEditEmployee = canEdit(moduleName);
  const canDeleteEmployee = canDelete(moduleName);
  const hasAccess = hasModuleAccess(moduleName);

  // If user doesn't have access to this module, show message
  useEffect(() => {
    if (!permissionsLoading && !hasAccess) {
      message.warning('You do not have permission to access the employees module');
    }
  }, [permissionsLoading, hasAccess]);

  // Fetch employees from API
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const searchParam = searchText.trim() || undefined;
      
      // Format dates as YYYY-MM-DD for API
      const fromDateParam = dateRange && dateRange[0] 
        ? dateRange[0].format('YYYY-MM-DD') 
        : undefined;
      const toDateParam = dateRange && dateRange[1] 
        ? dateRange[1].format('YYYY-MM-DD') 
        : undefined;
      
      const response = await getEmployees(
        searchParam, 
        fromDateParam, 
        toDateParam,
        currentPage,
        pageSize
      );
      
      // Transform API data to display format
      const transformedEmployees: EmployeeDisplay[] = response.data.map((item: any) => ({
        id: item.id,
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        email: item.email,
        phone: item.phone,
        role: item.roleName || item.role, // Use roleName if available, fallback to role
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      
      setEmployees(transformedEmployees);
      setTotal(response.meta?.total || response.data.length);
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error(getApiErrorMessage(error, 'Failed to fetch employees'));
    } finally {
      setLoading(false);
    }
  }, [searchText, dateRange, currentPage, pageSize]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, dateRange]);

  const handleAdd = () => {
    navigate('/employees/form', { state: { mode: 'add' } });
  };

  const handleView = async (employee: EmployeeDisplay) => {
    try {
      const employeeData = await getEmployeeById(employee.id);
      setViewingEmployee({
        id: employeeData.id,
        firstName: employeeData.firstName || '',
        lastName: employeeData.lastName || '',
        email: employeeData.email,
        phone: employeeData.phone,
        role: employeeData.roleName || employeeData.role,
        isActive: employeeData.isActive,
        createdAt: employeeData.createdAt,
        updatedAt: employeeData.updatedAt,
      });
      setViewModalOpen(true);
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to load employee details'));
    }
  };

  const handleEdit = (employee: EmployeeDisplay) => {
    navigate('/employees/form', { 
      state: { 
        mode: 'edit',
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
      } 
    });
  };

  const handleDelete = async (employee: EmployeeDisplay) => {
    try {
      await deleteEmployee(employee.id);
      message.success('Employee deleted successfully');
      loadEmployees();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to delete employee'));
    }
  };

  const columns: TableColumn<EmployeeDisplay>[] = [
    {
      key: 'firstName',
      title: 'First Name',
      dataIndex: 'firstName',
      render: (text: string, record: EmployeeDisplay) => (
        <span className="font-medium text-text-primary">
          {text || '-'}
        </span>
      ),
    },
    {
      key: 'lastName',
      title: 'Last Name',
      dataIndex: 'lastName',
      render: (text: string) => text || '-',
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      render: (text: string) => (
        <span className="text-text-primary">{text}</span>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      render: (text: string) => text || '-',
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      render: (text: string) => (
        <span className="px-2 py-1 rounded-md bg-surface-2 text-text-secondary text-xs font-medium">
          {text}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: EmployeeDisplay) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleView(record)}
            disabled={!canViewEmployee}
            title={!canViewEmployee ? 'You do not have permission to view employees' : ''}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
            disabled={!canEditEmployee}
            title={!canEditEmployee ? 'You do not have permission to edit employees' : ''}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
            disabled={!canDeleteEmployee}
            title={!canDeleteEmployee ? 'You do not have permission to delete employees' : ''}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const viewFields: ViewField[] = [
    createTextField('First Name', viewingEmployee?.firstName),
    createTextField('Last Name', viewingEmployee?.lastName),
    createTextField('Email', viewingEmployee?.email),
    createTextField('Phone', viewingEmployee?.phone),
    createTextField('Role', viewingEmployee?.role),
    createTextField('Status', viewingEmployee?.isActive ? 'Active' : 'Inactive'),
    createDateField('Created At', viewingEmployee?.createdAt),
    createDateField('Updated At', viewingEmployee?.updatedAt),
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-2">Employees</h1>
        <p className="text-text-secondary">Manage your employees</p>
      </div>

      <div className="mb-4 flex justify-between items-center gap-4">
        <div className="flex gap-4 flex-1">
          <Input
            placeholder="Search employees..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
            allowClear
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="YYYY-MM-DD"
            placeholder={['From Date', 'To Date']}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
          disabled={!canCreateEmployee}
          title={!canCreateEmployee ? 'You do not have permission to create employees' : ''}
        >
          Add Employee
        </Button>
      </div>

      <Spin spinning={loading}>
        <DataTable
          columns={columns}
          data={employees}
          getRowId={(record) => record.id}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 10);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} employees`,
          }}
        />
      </Spin>

      <ViewModal
        open={viewModalOpen}
        title="Employee Details"
        fields={viewFields}
        onClose={() => {
          setViewModalOpen(false);
          setViewingEmployee(null);
        }}
      />
    </div>
  );
};

export default Employees;

