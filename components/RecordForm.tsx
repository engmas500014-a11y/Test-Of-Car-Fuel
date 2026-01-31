
import React, { useState, useEffect } from 'react';

interface Props {
  onAdd: (data: { date: string; startOdometer: number; endOdometer: number; pricePerLiter: number; dailyPrice: number }) => void;
  lastEndOdometer: number;
  fixedFuelPrice: number;
}

const RecordForm: React.FC<Props> = ({ onAdd, lastEndOdometer, fixedFuelPrice }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startOdometer: lastEndOdometer || 0,
    endOdometer: 0,
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);

  useEffect(() => {
    const distance = formData.endOdometer - formData.startOdometer;
    if (distance > 0 && fixedFuelPrice > 0) {
      // المعادلة: ((النهاية - البداية) / 12) * سعر اللتر المحدد من المسؤول
      const price = (distance / 12) * fixedFuelPrice;
      setCalculatedPrice(price);
    } else {
      setCalculatedPrice(0);
    }
  }, [formData.startOdometer, formData.endOdometer, fixedFuelPrice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.endOdometer <= formData.startOdometer) {
      alert("يجب أن تكون نهاية العداد أكبر من بدايته");
      return;
    }
    onAdd({
      ...formData,
      pricePerLiter: fixedFuelPrice,
      dailyPrice: calculatedPrice
    });
    setFormData(prev => ({
      ...prev,
      startOdometer: formData.endOdometer,
      endOdometer: 0
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <i className="fas fa-gas-pump text-emerald-600"></i>
        تسجيل مشوار جديد
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">تاريخ اليوم</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">بداية العداد</label>
            <input 
              type="number" 
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
              value={formData.startOdometer || ''}
              onChange={e => setFormData({...formData, startOdometer: parseFloat(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">نهاية العداد</label>
            <input 
              type="number" 
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold"
              value={formData.endOdometer || ''}
              onChange={e => setFormData({...formData, endOdometer: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">سعر اللتر (إدارة):</span>
          <span className="text-sm font-black text-slate-700">{fixedFuelPrice} ج.م</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-bold">التكلفة المحسوبة:</span>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">{calculatedPrice.toFixed(2)} <small className="text-sm">ج.م</small></span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-emerald-500 flex justify-between">
            <span>المسافة: {(formData.endOdometer - formData.startOdometer) > 0 ? (formData.endOdometer - formData.startOdometer) : 0} كم</span>
            <span>المعادلة: (المسافة / 12) × {fixedFuelPrice}</span>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          <i className="fas fa-save"></i>
          حفظ المشوار
        </button>
      </form>
    </div>
  );
};

export default RecordForm;
