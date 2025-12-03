import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Employee } from './api';

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employee = location.state as Employee | null;

  useEffect(() => {
    if (!employee) {
      navigate('/employees');
    }
  }, [employee, navigate]);

  if (!employee) {
    return null;
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'red';
  };

  const getRoleColor = (role?: string) => {
    if (!role) return 'default';
    
    const normalizedRole = role.toUpperCase();
    if (normalizedRole.includes('ADMIN') || normalizedRole.includes('SUPER')) {
      return 'purple';
    }
    if (normalizedRole.includes('MANAGER')) {
      return 'blue';
    }
    return 'orange';
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/employees')}
          className="mb-6"
        >
          Back to Employees List
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold m-7" style={{ color: 'var(--text-primary)' }}>Employee Details</h2>}
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
          <Descriptions
            column={1}
            bordered
            labelStyle={{ 
              fontWeight: 'bold', 
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-primary)',
              width: '200px'
            }}
            contentStyle={{ 
              backgroundColor: 'var(--surface-1)',
              color: 'var(--text-primary)'
            }}
          >
            <Descriptions.Item label="First Name">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{employee.firstName || '-'}</span>
            </Descriptions.Item>
            
            <Descriptions.Item label="Last Name">
              {employee.lastName || '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label="Email">
              {employee.email}
            </Descriptions.Item>
            
            {employee.phone && (
              <Descriptions.Item label="Phone">
                {employee.phone}
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Role">
              <Tag color={getRoleColor(employee.permissionsRoleName || employee.roleName || employee.role)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {employee.permissionsRoleName || employee.roleName || employee.role}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(employee.isActive)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            
            {employee.createdAt && (
              <Descriptions.Item label="Created At">
                {new Date(employee.createdAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
            
            {employee.updatedAt && (
              <Descriptions.Item label="Last Updated">
                {new Date(employee.updatedAt).toLocaleString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Space className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate('/employees/form', { state: { ...employee, mode: 'edit' } })}
              style={{ 
                backgroundColor: 'var(--brand)', 
                borderColor: 'var(--brand)',
              }}
            >
              Edit Employee
            </Button>
            <Button onClick={() => navigate('/employees')}>
              Back to List
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
}

export default View;

