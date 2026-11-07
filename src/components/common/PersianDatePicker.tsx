import React, { useState, useEffect, useRef } from 'react';
import {
  JalaaliDate,
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_SHORT,
  getTodayJalaali,
  jalaaliMonthLength,
  getJalaaliDayOfWeek,
  formatJalaaliDate,
  parseJalaaliString,
  toPersianDigits,
  toEnglishDigits
} from '../../utils/jalali';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check
} from 'lucide-react';

export interface PersianDatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  placeholder = '۱۴۰۵/۰۸/۰۱',
  className = '',
  inputClassName = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = getTodayJalaali();
  const parsedValue = parseJalaaliString(value);

  const [viewYear, setViewYear] = useState<number>(parsedValue?.jy || today.jy);
  const [viewMonth, setViewMonth] = useState<number>(parsedValue?.jm || today.jm);

  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.jy);
      setViewMonth(parsedValue.jm);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    onChange(toPersianDigits(inputVal));
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formatted = formatJalaaliDate(viewYear, viewMonth, day, true);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const formatted = formatJalaaliDate(today.jy, today.jm, today.jd, true);
    onChange(formatted);
    setViewYear(today.jy);
    setViewMonth(today.jm);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const monthDaysCount = jalaaliMonthLength(viewYear, viewMonth);
  const startDayOfWeek = getJalaaliDayOfWeek(viewYear, viewMonth, 1);

  const yearRange = Array.from({ length: 25 }, (_, i) => 1395 + i);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div className="flex items-center gap-1 w-full relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`px-2.5 py-1 text-center font-mono text-xs border border-slate-300 rounded focus:outline-none focus:border-[#0288d1] bg-white text-slate-800 ${inputClassName}`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 border border-slate-300 rounded bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-[#0288d1] transition-colors shrink-0"
          title="باز کردن تقویم شمسی"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-slate-300 rounded-xl shadow-2xl p-3 w-64 text-slate-800 text-xs animate-in fade-in zoom-in-95 duration-100 select-none">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2 gap-1">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
              title="ماه بعد"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 font-bold text-xs text-slate-800">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-transparent font-bold text-xs cursor-pointer focus:outline-none border-b border-dashed border-sky-400 py-0.5"
              >
                {PERSIAN_MONTH_NAMES.map((mName, idx) => (
                  <option key={idx} value={idx + 1}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-transparent font-mono font-bold text-xs cursor-pointer focus:outline-none border-b border-dashed border-sky-400 py-0.5"
              >
                {yearRange.map((yr) => (
                  <option key={yr} value={yr}>
                    {toPersianDigits(yr)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
              title="ماه قبل"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-500 mb-1">
            {PERSIAN_WEEKDAY_SHORT.map((wd, i) => (
              <div key={i} className={i === 6 ? 'text-rose-500' : ''}>
                {wd}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-6"></div>
            ))}

            {Array.from({ length: monthDaysCount }).map((_, idx) => {
              const day = idx + 1;
              const isSelected =
                parsedValue &&
                parsedValue.jy === viewYear &&
                parsedValue.jm === viewMonth &&
                parsedValue.jd === day;
              const isToday =
                today.jy === viewYear && today.jm === viewMonth && today.jd === day;
              const dayOfWeek = (startDayOfWeek + idx) % 7;
              const isFriday = dayOfWeek === 6;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-7 w-7 mx-auto rounded text-xs font-mono font-medium transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#0288d1] text-white font-bold shadow-xs scale-105'
                      : isToday
                      ? 'border border-[#0288d1] text-[#0288d1] font-bold hover:bg-sky-50'
                      : isFriday
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-2 text-[11px]">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[#0288d1] hover:underline font-bold"
            >
              انتخاب امروز ({toPersianDigits(today.jd)} {PERSIAN_MONTH_NAMES[today.jm - 1]})
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-600"
            >
              پاک کردن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
