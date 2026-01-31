
import React, { useState } from 'react';
import { RefuelRecord } from '../types';

interface Props {
  refuels: RefuelRecord[];
  // Fix: The parent component App.tsx handles adding the userId, so we omit it here
  onAdd: (data: Omit<RefuelRecord, 'id' | 'userId'>) => void;
  onDelete: (id: string) => void;
  isAndroid?: boolean;
  hideList?: boolean;
}

const RefuelPage: React.FC<Props> = ({ refuels, onAdd, onDelete, hideList = false }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    liters: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    onAdd(formData);
    setFormData({ ...formData, amount: 0, liters: 0 });
  };

  const totalAmount = refuels.reduce((acc, curr) => acc + curr.amount, 0);

  if (hideList) {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">تاريخ التفويله</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">المبلغ المدفوع (ج.م)</label>
          <input 
            type="number" 
            required
            placeholder="0.00"
            className="w-full px-4 py-4 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-blue-700 text-2xl"
            value={formData.amount || ''}
            onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2">عدد اللترات (اختياري)</label>
          <input 
            type="number" 
            step="0.01"
            placeholder="0"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
            value={formData.liters || ''}
            onChange={e => setFormData({...formData, liters: parseFloat(e.target.value)})}
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-transform mt-4"
        >
          حفظ التفويلة
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="opacity-80 text-xs font-bold mb-1 uppercase tracking-widest">إجمالي مصاريف البنزين</p>
          <h2 className="text-4xl font-black">{totalAmount.toLocaleString()} <small className="text-lg font-normal">ج.م</small></h2>
          <div className="mt-4 flex gap-4 text-xs font-bold">
            <span className="bg-white/20 px-3 py-1 rounded-full">مرات التفويل: {refuels.length}</span>
          </div>
        </div>
        <i className="fas fa-gas-pump absolute -bottom-4 -left-4 text-8xl opacity-10 rotate-12"></i>
      </div>

      <div className="flex items-center justify-between px-2">
        <h2 className="font-black text-slate-800">سجل التفويلات</h2>
      </div>

      <div className="space-y-3">
        {refuels.length > 0 ? refuels.map(refuel => (
          <div key={refuel.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-fill-drip text-sm"></i>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">{refuel.date}</div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {refuel.liters ? `${refuel.liters} لتر` : 'تفويلة غير محددة اللترات'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-black text-blue-600">{refuel.amount.toLocaleString()} <small className="text-[8px]">ج.م</small></div>
              <button 
                onClick={() => onDelete(refuel.id)}
                className="w-8 h-8 text-slate-300 hover:text-rose-500"
              >
                <i className="fas fa-trash-alt text-sm"></i>
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <i className="fas fa-list-ul text-4xl text-slate-100 mb-4"></i>
            <p className="text-slate-400 text-sm">لا توجد تفويلات محفوظة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefuelPage;
