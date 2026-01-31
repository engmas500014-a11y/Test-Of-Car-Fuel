
import React from 'react';
import { FuelRecord } from '../types';

interface Props {
  records: FuelRecord[];
  onDelete: (id: string) => void;
}

const HistoryTable: React.FC<Props> = ({ records, onDelete }) => {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <i className="fas fa-history text-4xl text-slate-200 mb-4"></i>
        <p className="text-slate-400 text-sm">لا توجد مشاوير مسجلة بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map(record => (
        <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center active:bg-slate-50 transition-colors">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <i className="fas fa-map-marker-alt text-sm"></i>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">
                {(record.endOdometer - record.startOdometer).toLocaleString()} كم
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                {record.date} • {record.startOdometer} → {record.endOdometer}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-black text-emerald-600">{record.dailyPrice.toFixed(2)} <small className="text-[8px]">ج.م</small></div>
              <div className="text-[8px] text-slate-400">سعر اللتر: {record.pricePerLiter}</div>
            </div>
            <button 
              onClick={() => onDelete(record.id)}
              className="w-8 h-8 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <i className="fas fa-trash-alt text-sm"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTable;
