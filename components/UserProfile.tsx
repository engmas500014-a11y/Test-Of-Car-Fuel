
import React, { useState, useMemo } from 'react';
import { User, FuelRecord, RefuelRecord } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  currentUser: User;
  users: User[];
  onLogout: () => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  allRecords: FuelRecord[];
  allRefuels: RefuelRecord[];
  globalFuelPrice: number;
  onUpdateFuelPrice: (price: number) => void;
}

const UserProfile: React.FC<Props> = ({ 
  currentUser, 
  users, 
  onLogout, 
  onAddUser, 
  onUpdateUser, 
  onDeleteUser,
  allRecords, 
  allRefuels,
  globalFuelPrice,
  onUpdateFuelPrice
}) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'regular' as const });
  const [editData, setEditData] = useState({ username: '', password: '', role: 'regular' as const });
  const [successMsg, setSuccessMsg] = useState('');
  
  const [tempPrice, setTempPrice] = useState(globalFuelPrice.toString());

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      id: uuidv4(),
      ...newUser,
      createdAt: new Date().toISOString()
    });
    setNewUser({ username: '', password: '', role: 'regular' });
    setShowAddUser(false);
    setSuccessMsg('تمت إضافة المستخدم بنجاح');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(tempPrice);
    if (!isNaN(price) && price > 0) {
      onUpdateFuelPrice(price);
      setSuccessMsg('تم تحديث سعر البنزين لجميع السائقين');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const usersStats = useMemo(() => {
    return users.map(user => {
      const userRecords = allRecords.filter(r => {
        const d = new Date(r.date);
        return r.userId === user.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const userRefuels = allRefuels.filter(r => {
        const d = new Date(r.date);
        return r.userId === user.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const totalSpent = userRecords.reduce((acc, curr) => acc + curr.dailyPrice, 0);
      const totalRefueled = userRefuels.reduce((acc, curr) => acc + curr.amount, 0);
      return { ...user, totalSpent, totalRefueled, balance: totalRefueled - totalSpent };
    });
  }, [users, allRecords, allRefuels, currentMonth, currentYear]);

  const exportAllDriversToExcel = () => {
    let csvContent = "\uFEFF"; 
    csvContent += `تقرير ملخص حسابات السائقين - شهر ${currentMonth + 1} سنة ${currentYear}\n`;
    csvContent += "اسم السائق,إجمالي التفويل (ج.م),إجمالي الاستهلاك (ج.م),الرصيد المتبقي (ج.م),الحالة\n";

    usersStats.forEach(u => {
      const status = u.balance >= 0 ? "فائض" : "عجز";
      csvContent += `${u.username},${u.totalRefueled.toFixed(2)},${u.totalSpent.toFixed(2)},${u.balance.toFixed(2)},${status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ملخص_حسابات_السائقين_${currentMonth + 1}_${currentYear}.csv`);
    link.click();
    setSuccessMsg('تم تصدير ملخص جميع السائقين بنجاح');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const exportToExcel = (user: User) => {
    const userRecords = allRecords.filter(r => r.userId === user.id);
    const userRefuels = allRefuels.filter(r => r.userId === user.id);

    let csvContent = "\uFEFF";
    csvContent += `سجل تفصيلي للسائق: ${user.username}\n`;
    csvContent += "سجل المشاوير\n";
    csvContent += "التاريخ,بداية العداد,نهاية العداد,المسافة (كم),سعر اللتر,التكلفة (ج.م)\n";
    
    userRecords.forEach(r => {
      const distance = r.endOdometer - r.startOdometer;
      csvContent += `${r.date},${r.startOdometer},${r.endOdometer},${distance},${r.pricePerLiter},${r.dailyPrice.toFixed(2)}\n`;
    });

    csvContent += "\n\nسجل التفويلات\n";
    csvContent += "التاريخ,المبلغ (ج.م),اللترات\n";
    
    userRefuels.forEach(r => {
      csvContent += `${r.date},${r.amount},${r.liters || '-'}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_${user.username}_تفصيلي.csv`);
    link.click();
    setSuccessMsg(`تم تصدير تقرير ${user.username} التفصيلي`);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditData({ 
      username: user.username, 
      password: user.password || '',
      role: user.role
    });
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    const targetUser = users.find(u => u.id === editingUserId);
    if (targetUser) {
      onUpdateUser({ 
        ...targetUser, 
        username: editData.username, 
        password: editData.password,
        role: editData.role
      });
      setEditingUserId(null);
      setSuccessMsg('تم تحديث البيانات بنجاح');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleDeleteClick = (userId: string, username: string) => {
    if (window.confirm(`⚠️ تحذير: هل أنت متأكد من حذف السائق "${username}"؟ سيتم مسح جميع سجلاته وتفويلاته من النظام نهائياً ولا يمكن استرجاعها.`)) {
      onDeleteUser(userId);
      setSuccessMsg(`تم حذف المستخدم ${username} وسجلاته بنجاح`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-white p-3 rounded-2xl text-xs font-bold text-center shadow-lg animate-bounce z-[100] w-2/3">
          {successMsg}
        </div>
      )}

      {/* Profile/Edit Self Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        {editingUserId !== currentUser.id ? (
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-black">{currentUser.username[0].toUpperCase()}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800">{currentUser.username}</h2>
                <button onClick={() => startEditing(currentUser)} className="w-7 h-7 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center text-[10px]"><i className="fas fa-pen"></i></button>
              </div>
              <p className="text-xs text-slate-400">منذ: {new Date(currentUser.createdAt).toLocaleDateString('ar-EG')}</p>
            </div>
            <button onClick={onLogout} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center"><i className="fas fa-sign-out-alt"></i></button>
          </div>
        ) : (
          <form onSubmit={handleUpdateUser} className="space-y-4">
             <div className="flex justify-between items-center"><h3 className="font-black text-slate-800 text-sm">تعديل بياناتي</h3><button type="button" onClick={() => setEditingUserId(null)} className="text-xs text-slate-400">إلغاء</button></div>
             <input className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-right font-bold text-sm" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} required />
             <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none text-right font-bold text-sm" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} required />
             <button className="w-full bg-slate-800 text-white py-3 rounded-xl font-black text-sm shadow-md">حفظ البيانات</button>
          </form>
        )}
      </div>

      {currentUser.role === 'main' && (
        <>
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-gas-pump text-emerald-400"></i>
                  <h3 className="font-black text-sm">تحديد سعر البنزين (للكل)</h3>
                </div>
                <form onSubmit={handlePriceUpdate} className="flex gap-3">
                  <input type="number" step="0.01" className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center font-black text-xl outline-none focus:ring-2 focus:ring-emerald-500" value={tempPrice} onChange={e => setTempPrice(e.target.value)} />
                  <button className="bg-emerald-600 px-6 py-3 rounded-xl font-black text-xs shadow-lg active:scale-95 transition-transform">تحديث</button>
                </form>
             </div>
             <i className="fas fa-coins absolute -bottom-4 -left-4 text-7xl opacity-10"></i>
          </div>

          {/* Accounts Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-slate-800 text-sm">حسابات السائقين - الشهر الحالي</h3>
              <button 
                onClick={exportAllDriversToExcel}
                className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all"
              >
                <i className="fas fa-cloud-download-alt text-xs"></i>
                تصدير الكل
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {usersStats.map(u => (
                <div key={u.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{u.username[0].toUpperCase()}</div>
                      <span className="font-black text-slate-800 text-sm">{u.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => exportToExcel(u)}
                        className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <i className="fas fa-file-excel"></i>
                        Excel
                      </button>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.balance >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {u.balance >= 0 ? 'فائض' : 'عجز'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><p className="text-[8px] text-slate-400 font-bold uppercase">تفويل</p><p className="text-xs font-black text-blue-600">{u.totalRefueled.toLocaleString()}</p></div>
                    <div><p className="text-[8px] text-slate-400 font-bold uppercase">استهلاك</p><p className="text-xs font-black text-amber-600">{u.totalSpent.toLocaleString()}</p></div>
                    <div><p className="text-[8px] text-slate-400 font-bold uppercase">الرصيد</p><p className={`text-xs font-black ${u.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{Math.abs(u.balance).toLocaleString()}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Management Section */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-slate-800">إدارة المستخدمين</h3>
              <button onClick={() => setShowAddUser(!showAddUser)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full font-bold">{showAddUser ? 'إلغاء' : 'إضافة مستخدم'}</button>
            </div>
            
            {showAddUser && (
              <form onSubmit={handleAddUser} className="bg-white p-6 rounded-3xl shadow-md border-2 border-emerald-100 space-y-4 animate-in slide-in-from-top duration-300">
                <input placeholder="اسم المستخدم" className="w-full px-4 py-3 rounded-xl bg-slate-50 outline-none text-right font-bold text-sm border border-slate-100" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required />
                <input type="text" placeholder="كلمة السر" className="w-full px-4 py-3 rounded-xl bg-slate-50 outline-none text-right font-bold text-sm border border-slate-100" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 outline-none font-bold text-right text-sm border border-slate-100" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                  <option value="regular">سائق عادي</option>
                  <option value="main">مسؤول أساسي</option>
                </select>
                <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-black shadow-lg">حفظ المستخدم الجديد</button>
              </form>
            )}

            <div className="space-y-3">
              {users.map(u => u.id !== currentUser.id && (
                <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  {editingUserId === u.id ? (
                    <form onSubmit={handleUpdateUser} className="space-y-3 p-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-emerald-600">تعديل بيانات السائق</span>
                        <button type="button" onClick={() => setEditingUserId(null)} className="text-[10px] text-slate-400">إلغاء</button>
                      </div>
                      <input className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-right text-sm font-bold" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} required />
                      <input type="text" className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-right text-sm font-bold" value={editData.password} onChange={e => setEditData({...editData, password: e.target.value})} required />
                      <select className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-right text-sm font-bold" value={editData.role} onChange={e => setEditData({...editData, role: e.target.value as any})}>
                        <option value="regular">سائق عادي</option>
                        <option value="main">مسؤول أساسي</option>
                      </select>
                      <button className="w-full bg-slate-800 text-white py-2 rounded-lg text-xs font-black">حفظ التغييرات</button>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{u.username[0].toUpperCase()}</div>
                        <div>
                          <div className="text-sm font-black text-slate-800">{u.username}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{u.role === 'main' ? 'مسؤول' : 'سائق'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => startEditing(u)} 
                          className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-sm hover:bg-blue-500 hover:text-white transition-all"
                          title="تعديل"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(u.id, u.username)} 
                          className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center text-sm hover:bg-rose-500 hover:text-white transition-all"
                          title="حذف"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="bg-slate-100 p-6 rounded-3xl text-center border-2 border-dashed border-slate-300 opacity-60">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">إصدار التطبيق 3.2 - أندرويد (Delete Enabled with Full Cleanup)</p>
      </div>
    </div>
  );
};

export default UserProfile;
