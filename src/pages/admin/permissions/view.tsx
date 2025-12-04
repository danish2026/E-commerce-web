import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Descriptions, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { usePermissionTranslation } from '../../../hooks/usePermissionTranslation';
import { Permission } from './api';

const View = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = usePermissionTranslation();
  const permission = location.state as Permission | null;

  useEffect(() => {
    if (!permission) {
      navigate('/permissions');
    }
  }, [permission, navigate]);

  if (!permission) {
    return null;
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/permissions')}
          className="mb-6"
        >
          {t.backToPermissionsList}
        </Button>

        <Card
          title={<h2 className="text-2xl m-7 font-bold m-0" style={{ color: 'var(--text-primary)' }}>{t.permissionDetails}</h2>}
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
            <Descriptions.Item label={t.id}>
              <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{permission.id}</span>
            </Descriptions.Item>
            
            <Descriptions.Item label={t.module}>
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {permission.module.charAt(0).toUpperCase() + permission.module.slice(1)}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label={t.action}>
              <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label={t.description}>
              {permission.description || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>{t.noDescriptionProvided}</span>}
            </Descriptions.Item>
            
            {permission.createdAt && (
              <Descriptions.Item label={t.createdAt}>
                {formatDate(permission.createdAt)}
              </Descriptions.Item>
            )}
            
            {permission.updatedAt && (
              <Descriptions.Item label={t.lastUpdated}>
                {formatDate(permission.updatedAt)}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Space className="mt-6">
            <Button
              type="primary"
              onClick={() => navigate('/permissions/form', { state: { ...permission, mode: 'edit' } })}
              style={{ 
                backgroundColor: 'var(--brand)', 
                borderColor: 'var(--brand)',
              }}
            >
              {t.editPermission}
            </Button>
            <Button onClick={() => navigate('/permissions')}>
              {t.backToList}
            </Button>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default View;

