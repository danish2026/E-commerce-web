import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const RangePicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const handleClickOutside = (event:any) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date:any) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        date: new Date(year, month, i), 
        isCurrentMonth: true 
      });
    }

    return days;
  };

  const handleDateClick = (date: Date | null) => {
    if (!date) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const isDateInRange = (date: Date | null) => {
    if (!date || !startDate) return false;
    
    const compareDate = endDate || hoverDate;
    if (!compareDate) return false;

    const start = startDate < compareDate ? startDate : compareDate;
    const end = startDate < compareDate ? compareDate : startDate;

    return date >= start && date <= end;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date) return false;
    return (startDate && date.toDateString() === startDate.toDateString()) ||
           (endDate && date.toDateString() === endDate.toDateString());
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 h-11 px-4 text-sm rounded-lg font-medium transition border border-white/10 text-text-primary hover:border-white/30 hover:bg-surface-2/40 bg-transparent dark:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand min-w-[280px]"
      >
        <span className="text-gray-400">
          {startDate && endDate 
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : startDate
            ? formatDate(startDate)
            : 'Select date range'}
        </span>
        <Calendar className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 rounded-lg border border-white/10 bg-gray-900 shadow-xl z-50 dark:border-white/20">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-surface-2/60 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-surface-2/60 rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-xs text-gray-400 font-medium p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isInRange = day.date && isDateInRange(day.date);
              const isSelected = day.date && isDateSelected(day.date);
              const isStart = startDate && day.date && day.date.toDateString() === startDate.toDateString();
              const isEnd = endDate && day.date && day.date.toDateString() === endDate.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day.date)}
                  onMouseEnter={() => day.date && setHoverDate(day.date)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    p-2 text-sm rounded-lg transition relative
                    ${!day.isCurrentMonth ? 'invisible' : ''}
                    ${isSelected ? 'bg-blue-600 text-white font-semibold' : ''}
                    ${isInRange && !isSelected ? 'bg-blue-600/20' : ''}
                    ${!isSelected && !isInRange && day.isCurrentMonth ? 'hover:bg-surface-2/60' : ''}
                    ${isStart ? 'rounded-r-none' : ''}
                    ${isEnd ? 'rounded-l-none' : ''}
                  `}
                >
                  {day.date ? day.date.getDate() : ''}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex gap-2 justify-end">
            <button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setHoverDate(null);
              }}
              className="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-2/60 transition"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:opacity-90 transition font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RangePicker;