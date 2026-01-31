
import React from 'react';
import { FuelRecord, RefuelRecord } from '../types';

interface Props {
  records: FuelRecord[];
  refuels: RefuelRecord[];
}

const MonthlyReport: React.FC<Props> = ({ records, refuels }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // إجمالي تكلفة المشاوير (المحسوبة بالمعادلة)
  const monthlyTripsCost = records
    .filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.dailyPrice, 0);

  // إجمالي مبالغ التفويل (المدفوعة فعلياً)
  const monthlyRefuelTotal = refuels
    .filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  // الحسبة المطلوبة: التفويل - المشاوير
  const balance = monthlyRefuelTotal - monthlyTripsCost;
  const monthName = new Intl.DateTimeFormat('ar-EG', { month: 'long' }).format(new Date());

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center">
        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">ملخص الشهر الحالي</span>
        <h2 className="text-2xl font-black text-slate-800 mt-3">{monthName} {currentYear}</h2>
      </div>

      {/* Main Calculation Card */}
      <div className={`p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden transition-all ${balance >= 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
        <div className="relative z-10">
          <p className="opacity-80 text-sm font-bold mb-2">الرصيد المتبقي (بنزين في التانك)</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black tracking-tighter">
              {Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-lg opacity-80 font-bold">ج.م</span>
          </div>
          <p className="mt-4 text-xs font-medium opacity-90 leading-relaxed">
            {balance >= 0 
              ? "لديك فائض! هذا المبلغ يمثل قيمة البنزين الموجود حالياً في سيارتك ولم تستهلكه بعد." 
              : "تنبيه: لقد استهلكت بنزين بقيمة أكبر مما قمت بتفويله (عجز في الميزانية)."}
          </p>
        </div>
        <i className={`fas ${balance >= 0 ? 'fa-chart-line' : 'fa-exclamation-triangle'} absolute -bottom-6 -left-6 text-[10rem] opacity-10`}></i>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <i className="fas fa-receipt text-sm"></i>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase">إجمالي التفويل</p>
          <h4 className="text-lg font-black text-slate-800 mt-1">{monthlyRefuelTotal.toLocaleString()} <small className="text-[10px]">ج.م</small></h4>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
            <i className="fas fa-car-side text-sm"></i>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase">إجمالي المشاوير</p>
          <h4 className="text-lg font-black text-slate-800 mt-1">{monthlyTripsCost.toLocaleString()} <small className="text-[10px]">ج.م</small></h4>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
          <i className="fas fa-percentage text-emerald-500"></i>
          معدل الاستهلاك الفعلي
        </h3>
        
        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 rounded-full ${balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${monthlyRefuelTotal > 0 ? Math.min((monthlyTripsCost / monthlyRefuelTotal) * 100, 100) : 0}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between mt-3">
          <span className="text-[10px] font-bold text-slate-400">0%</span>
          <span className="text-[10px] font-bold text-slate-800">
            {monthlyRefuelTotal > 0 ? ((monthlyTripsCost / monthlyRefuelTotal) * 100).toFixed(1) : 0}% من ميزانية التفويل
          </span>
          <span className="text-[10px] font-bold text-slate-400">100%</span>
        </div>
      </div>

      {/* Info Android Card */}
      <div className="bg-slate-800 p-6 rounded-3xl text-white shadow-lg">
        <div className="flex gap-4 items-start">
          <div className="bg-white/10 p-3 rounded-2xl">
            <i className="fas fa-info-circle text-emerald-400"></i>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">كيف تحسبها؟</h4>
            <p className="text-[11px] opacity-70 leading-relaxed">
              نقوم بطرح "إجمالي حساب المشاوير" (اللي هو استهلاكك الفعلي) من "إجمالي مبالغ التفويل" (اللي دفعته كاش). 
              الناتج يخبرك بقيمة البنزين المتبقي حالياً في سيارتك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
