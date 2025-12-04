import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEmployeeTranslation } from '../../../hooks/useEmployeeTranslation';
import { Employee } from './api';

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useEmployeeTranslation();
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
          {t.backToEmployeesList}
        </Button>

        <Card
          title={<h2 className="text-2xl font-bold m-7" style={{ color: 'var(--text-primary)' }}>{t.employeeDetails}</h2>}
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
            <Descriptions.Item label={t.firstName}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{employee.firstName || '-'}</span>
            </Descriptions.Item>
            
            <Descriptions.Item label={t.lastName}>
              {employee.lastName || '-'}
            </Descriptions.Item>
            
            <Descriptions.Item label={t.email}>
              {employee.email}
            </Descriptions.Item>
            
            {employee.phone && (
              <Descriptions.Item label={t.phone}>
                {employee.phone}
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label={t.role}>
              <Tag color={getRoleColor(employee.permissionsRoleName || employee.roleName || employee.role)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {employee.permissionsRoleName || employee.roleName || employee.role}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label={t.status}>
              <Tag color={getStatusColor(employee.isActive)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                {employee.isActive ? t.active : t.inactive}
              </Tag>
            </Descriptions.Item>
            
            {employee.createdAt && (
              <Descriptions.Item label={t.createdAt}>
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
              <Descriptions.Item label={t.lastUpdated}>
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
              {t.editEmployee}
            </Button>
            <Button onClick={() => navigate('/employees')}>
              {t.backToList}
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
}

export default View;

