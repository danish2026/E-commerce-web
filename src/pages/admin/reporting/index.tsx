import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Space, Table, message, Spin } from 'antd';
import RangePicker from '../../../components/ui/RangePicker';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { FilePdfOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import jsPDF from 'jspdf';
import LanguageSelector from '../../../components/purchase/LanguageSelector';
import { useReportingTranslation } from '../../../hooks/useReportingTranslation';
import {
  fetchReportingData,
  getApiErrorMessage,
  ReportFilter,
  ReportingData,
} from './ReportingService';


interface ReportTableItem {
  key: string;
  metric: string;
  value: string | number;
  period: string;
}

const Reporting = () => {
  const { t, translate } = useReportingTranslation();
  const [filter, setFilter] = useState<ReportFilter>('Daily');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [data, setData] = useState<ReportTableItem[]>([]);
  const [reportingData, setReportingData] = useState<ReportingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(false);

  const handleRefetch = () => {
    setRefetch(!refetch);
  };

  const loadReportingData = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
      const endDate = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

      const result = await fetchReportingData(filter, startDate, endDate);
      setReportingData(result);

      const tableData: ReportTableItem[] = [
        {
          key: '1',
          metric: t.revenue,
          value: `₹${result.revenue.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          period: filter,
        },
        {
          key: '2',
          metric: t.orders,
          value: result.orders,
          period: filter,
        },
        {
          key: '3',
          metric: t.averageOrderValue,
          value: `₹${(result.orders > 0 ? result.revenue / result.orders : 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          period: filter,
        },
      ];

      setData(tableData);
    } catch (error) {
      console.error('Error fetching reporting data:', error);
      message.error(getApiErrorMessage(error, t.failedToFetchReportingData));
    } finally {
      setLoading(false);
    }
  }, [filter, dateRange, t]);

  useEffect(() => {
    loadReportingData();
  }, [loadReportingData]);

  const downloadPDF = () => {
    if (!reportingData) {
      message.warning(t.noDataAvailableToDownload);
      return;
    }

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text(`${filter} ${t.report}`, 14, yPos);
    yPos += 15;

    doc.setFontSize(12);
    if (dateRange && dateRange[0] && dateRange[1]) {
      doc.text(
        `${t.period}: ${dateRange[0].format('DD MMM YYYY')} - ${dateRange[1].format('DD MMM YYYY')}`,
        14,
        yPos
      );
    } else {
      doc.text(`${t.generatedOn}: ${dayjs().format('DD MMM YYYY, HH:mm')}`, 14, yPos);
    }
    yPos += 15;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.summary, 14, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t.revenue}: ₹${reportingData.revenue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`, 14, yPos);
    yPos += 8;

    doc.text(`${t.totalOrders}: ${reportingData.orders}`, 14, yPos);
    yPos += 8;

    const avgOrderValue = reportingData.orders > 0 ? reportingData.revenue / reportingData.orders : 0;
    doc.text(`${t.averageOrderValue}: ₹${avgOrderValue.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`, 14, yPos);
    yPos += 15;

    if (reportingData.orderItems && reportingData.orderItems.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.recentOrders, 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      doc.setFont('helvetica', 'bold');
      doc.text(t.date, 14, yPos);
      doc.text(t.product, 60, yPos);
      doc.text(t.amount, 140, yPos);
      yPos += 6;
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos, 196, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      const itemsToShow = reportingData.orderItems.slice(0, 20);
      itemsToShow.forEach((item, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const date = dayjs(item.createdAt).format('DD MMM YY');
        const productName = item.product?.name || item.product?.sku || 'N/A';
        const amount = (Number(item.totalAmount ?? 0) - Number(item.discount ?? 0)).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        doc.text(date, 14, yPos);
        doc.text(productName.length > 30 ? productName.substring(0, 30) + '...' : productName, 60, yPos);
        doc.text(`₹${amount}`, 140, yPos);
        yPos += 6;
      });
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `${t.page} ${i} ${t.of} ${pageCount} - ${t.generatedOn} ${dayjs().format('DD MMM YYYY, HH:mm')}`,
        14,
        285
      );
    }

    const fileName = dateRange && dateRange[0] && dateRange[1]
      ? `${filter}_Report_${dateRange[0].format('YYYY-MM-DD')}_to_${dateRange[1].format('YYYY-MM-DD')}.pdf`
      : `${filter}_Report_${dayjs().format('YYYY-MM-DD')}.pdf`;
    
    doc.save(fileName);
    message.success(t.pdfReportDownloadedSuccessfully);
  };

  const handleFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilter(event.target.value as ReportFilter);
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };

  const clearDateRange = () => {
    setDateRange(null);
  };

  const handleReset = () => {
    setFilter('Daily');
    setDateRange(null);
    message.success(t.filtersResetToDefault);
  };

  const getDateRangeDisplay = () => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      return `${dateRange[0].format('DD MMM YYYY')} - ${dateRange[1].format('DD MMM YYYY')}`;
    }
    return '';
  };

  const getFilterDisplay = () => {
    switch (filter) {
      case 'Daily':
        return t.today;
      case 'Weekly':
        return t.last7Days;
      case 'Monthly':
        return t.currentMonth;
      case 'Yearly':
        return t.currentYear;
      default:
        return filter;
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary p-7">
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface-1 rounded-2xl shadow-card p-8 mb-6 border border-[var(--glass-border)]">
          <Space size="middle" className="w-full" direction="vertical">
            <div className="w-full">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t.reportPeriod}
                </label>
                <Space size="middle" className="w-full" wrap>
                  {/* <LanguageSelector /> */}
                  <Select value={filter} style={{ width: 150, height: '40px' }} onChange={handleFilterChange}>
                    <option value="Daily">{t.daily}</option>
                    <option value="Weekly">{t.weekly}</option>
                    <option value="Monthly">{t.monthly}</option>
                    <option value="Yearly">{t.yearly}</option>
                  </Select>

                  <div>
                    <RangePicker
                      value={dateRange}
                      onChange={handleDateRangeChange}
                      format="YYYY-MM-DD"
                      placeholder={[t.startDate, t.endDate]}
                      style={{ width: 300, height: '40px' }}
                      allowClear
                      disabledDate={(current) => {
                        return current && current > dayjs().endOf('day');
                      }}
                    />
                    {dateRange && dateRange[0] && dateRange[1] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearDateRange}
                        className="h-auto px-0 text-brand hover:text-brand/80"
                      >
                        {t.clear}
                      </Button>
                    )}
                  </div>

                  <Button
                    icon={<FilePdfOutlined />}
                    onClick={downloadPDF}
                    disabled={!reportingData || loading}
                    style={{ height: '40px' }}
                  >
                    {t.downloadPDF}
                  </Button>
                </Space>
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 6,
                  marginTop: 8,
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                {dateRange && dateRange[0] && dateRange[1] ? (
                  <>
                    <strong>{t.customDateRange}:</strong> {getDateRangeDisplay()}
                    <span style={{ marginLeft: 12, color: 'var(--text-tertiary)', fontSize: '11px' }}>
                      ({translate('overridesFilter', { filter: filter })})
                    </span>
                  </>
                ) : (
                  <>
                    <strong>{translate('usingFilter', { filter: filter })}:</strong> {getFilterDisplay()}
                    <span style={{ marginLeft: 12, color: 'var(--text-tertiary)', fontSize: '11px' }}>
                      ({t.selectDatesToUseCustomRange})
                    </span>
                  </>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <div style={{ marginTop: 20 }}>
                <Table
                  dataSource={data}
                  columns={[
                    {
                      title: t.metric,
                      dataIndex: 'metric',
                      key: 'metric',
                      width: '40%',
                    },
                    {
                      title: t.value,
                      dataIndex: 'value',
                      key: 'value',
                      width: '40%',
                    },
                    {
                      title: t.period,
                      dataIndex: 'period',
                      key: 'period',
                      width: '20%',
                    },
                  ]}
                  pagination={false}
                  locale={{ emptyText: t.noDataAvailable }}
                />
              </div>
            )}

            {reportingData && reportingData.orderItems && reportingData.orderItems.length > 0 && (
              <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  <strong>{t.totalOrderItems}:</strong> {reportingData.orderItems.length}
                </p>
              </div>
            )}
          </Space>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
