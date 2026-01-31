
import React from 'react';
import { Statistics } from '../types';

interface Props {
  stats: Statistics;
}

const Dashboard: React.FC<Props> = ({ stats }) => {
  const cards = [
    { label: 'إجمالي مسافة المشاوير', value: `${stats.totalDistance.toLocaleString()} كم`, icon: 'fa-road', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'تكلفة المشاوير الكلية', value: `${stats.totalCost.toLocaleString()} ج.م`, icon: 'fa-wallet', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'متوسط تكلفة المشوار', value: `${stats.averageDailyPrice.toFixed(2)} ج.م`, icon: 'fa-chart-pie', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'إجمالي شحن البنزين', value: `${stats.totalRefuelAmount.toLocaleString()} ج.م`, icon: 'fa-gas-pump', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className={`${card.bg} ${card.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl`}>
            <i className={`fas ${card.icon}`}></i>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{card.label}</p>
            <h3 className="text-xl font-bold text-slate-800">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
