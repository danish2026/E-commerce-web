import React from 'react';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { Dayjs } from 'dayjs';
import clsx from 'clsx';
import './RangePicker.css';

const { RangePicker: AntdRangePicker } = DatePicker;

export interface CustomRangePickerProps extends Omit<RangePickerProps, 'value' | 'onChange'> {
  value?: [Dayjs | null, Dayjs | null] | null;
  onChange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  className?: string;
}

const RangePicker = React.forwardRef<any, CustomRangePickerProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <div className={clsx('custom-range-picker-wrapper', className)}>
        <AntdRangePicker
          ref={ref}
          className="custom-range-picker"
          style={{
            width: '100%',
            height: '40px',
            ...style,
          }}
          {...props}
        />
      </div>
    );
  }
);

RangePicker.displayName = 'RangePicker';

export default RangePicker;
