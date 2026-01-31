
import React, { useState, useMemo, useEffect } from 'react';
import { FuelRecord, RefuelRecord, Statistics, User } from './types';
import Dashboard from './components/Dashboard';
import RecordForm from './components/RecordForm';
import HistoryTable from './components/HistoryTable';
import AIInsights from './components/AIInsights';
import RefuelPage from './components/RefuelPage';
import MonthlyReport from './components/MonthlyReport';
import UserProfile from './components/UserProfile';
import LoginScreen from './components/LoginScreen';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trips' | 'refuels' | 'monthly' | 'profile'>('trips');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [globalFuelPrice, setGlobalFuelPrice] = useState<number>(12.25);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [refuels, setRefuels] = useState<RefuelRecord[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Users
        const { data: usersData } = await supabase.from('users').select('*');
        if (usersData) setUsers(usersData);

        // Fetch Settings (Fuel Price)
        const { data: settingsData } = await supabase.from('settings').select('*').eq('key', 'global_fuel_price').single();
        if (settingsData) setGlobalFuelPrice(parseFloat(settingsData.value));

        // Fetch Records & Refuels
        const { data: recordsData } = await supabase.from('records').select('*').order('date', { ascending: false });
        if (recordsData) setRecords(recordsData);

        const { data: refuelsData } = await supabase.from('refuels').select('*').order('date', { ascending: false });
        if (refuelsData) setRefuels(refuelsData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'main') return records;
    return records.filter(r => r.userId === currentUser.id);
  }, [records, currentUser]);

  const filteredRefuels = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'main') return refuels;
    return refuels.filter(r => r.userId === currentUser.id);
  }, [refuels, currentUser]);

  const stats = useMemo((): Statistics => {
    const totalDistance = filteredRecords.reduce((acc, curr) => acc + (curr.endOdometer - curr.startOdometer), 0);
    const totalCost = filteredRecords.reduce((acc, curr) => acc + curr.dailyPrice, 0);
    const averageDailyPrice = filteredRecords.length > 0 ? totalCost / filteredRecords.length : 0;
    const totalRefuelAmount = filteredRefuels.reduce((acc, curr) => acc + curr.amount, 0);

    return { 
      totalDistance, 
      totalCost, 
      averageDailyPrice, 
      tripsCount: filteredRecords.length,
      totalRefuelAmount 
    };
  }, [filteredRecords, filteredRefuels]);

  if (!currentUser) {
    return <LoginScreen onLogin={(user) => {
      setCurrentUser(user);
      localStorage.setItem('current_user', JSON.stringify(user));
    }} users={users} />;
  }

  const addRecord = async (data: Omit<FuelRecord, 'id' | 'userId'>) => {
    const newRecord: FuelRecord = { ...data, id: uuidv4(), userId: currentUser.id };
    setRecords(prev => [newRecord, ...prev]);
    setShowAddModal(false);
    await supabase.from('records').insert([newRecord]);
  };

  const addRefuel = async (data: Omit<RefuelRecord, 'id' | 'userId'>) => {
    const newRefuel: RefuelRecord = { ...data, id: uuidv4(), userId: currentUser.id };
    setRefuels(prev => [newRefuel, ...prev]);
    setShowAddModal(false);
    await supabase.from('refuels').insert([newRefuel]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    await supabase.from('users').insert([user]);
  };

  const updateUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
    await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
  };

  const deleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setRecords(prev => prev.filter(r => r.userId !== userId));
    setRefuels(prev => prev.filter(r => r.userId !== userId));
    
    await supabase.from('users').delete().eq('id', userId);
    await supabase.from('records').delete().eq('userId', userId);
    await supabase.from('refuels').delete().eq('userId', userId);
  };

  const updateFuelPrice = async (price: number) => {
    setGlobalFuelPrice(price);
    await supabase.from('settings').upsert({ key: 'global_fuel_price', value: price.toString() });
  };

  const deleteRecord = async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    await supabase.from('records').delete().eq('id', id);
  };

  const deleteRefuel = async (id: string) => {
    setRefuels(prev => prev.filter(r => r.id !== id));
    await supabase.from('refuels').delete().eq('id', id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-600 flex flex-col items-center justify-center text-white font-['Cairo']">
        <i className="fas fa-spinner fa-spin text-5xl mb-4"></i>
        <h2 className="text-xl font-bold">جاري تحميل البيانات من السحابة...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-24 font-['Cairo'] overflow-x-hidden">
      <header className="bg-emerald-600 text-white pt-4 pb-4 px-6 shadow-md sticky top-0 z-40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <i className="fas fa-gas-pump text-xl"></i>
          <h1 className="text-xl font-bold tracking-wide">
            {activeTab === 'trips' && 'المشاوير'}
            {activeTab === 'refuels' && 'التفويلات'}
            {activeTab === 'monthly' && 'التقرير الشهري'}
            {activeTab === 'profile' && 'الملف الشخصي'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {currentUser.role === 'main' ? 'أساسي' : 'عادي'}
           </span>
        </div>
      </header>

      <main className="px-4 pt-6 max-w-2xl mx-auto">
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <Dashboard stats={stats} />
            <AIInsights records={filteredRecords} stats={stats} />
            <div className="flex items-center justify-between px-2">
              <h2 className="font-black text-slate-800">أحدث المشاوير</h2>
              <span className="text-xs text-slate-500">{filteredRecords.length} سجل</span>
            </div>
            <HistoryTable records={filteredRecords} onDelete={deleteRecord} />
          </div>
        )}
        
        {activeTab === 'refuels' && (
          <RefuelPage refuels={filteredRefuels} onAdd={addRefuel} onDelete={deleteRefuel} isAndroid={true} />
        )}

        {activeTab === 'monthly' && (
          <MonthlyReport records={filteredRecords} refuels={filteredRefuels} />
        )}

        {activeTab === 'profile' && (
          <UserProfile 
            currentUser={currentUser} 
            users={users} 
            onLogout={handleLogout} 
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            allRecords={records}
            allRefuels={refuels}
            globalFuelPrice={globalFuelPrice}
            onUpdateFuelPrice={updateFuelPrice}
          />
        )}
      </main>

      {(activeTab === 'trips' || activeTab === 'refuels') && (
        <button 
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 left-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-50 active:scale-95 transition-transform"
        >
          <i className="fas fa-plus"></i>
        </button>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">إضافة جديد</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-2">
                <i className="fas fa-times"></i>
              </button>
            </div>
            {activeTab === 'trips' ? (
              <RecordForm 
                onAdd={addRecord} 
                lastEndOdometer={records.find(r => r.userId === currentUser.id)?.endOdometer || 0} 
                fixedFuelPrice={globalFuelPrice}
              />
            ) : (
              <RefuelPage refuels={filteredRefuels} onAdd={addRefuel} onDelete={() => {}} hideList={true} />
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-around items-center z-40 safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('trips')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'trips' ? 'active-tab' : 'text-slate-400'}`}>
          <i className="fas fa-route text-lg"></i>
          <span className="text-[10px] font-bold">المشاوير</span>
        </button>
        <button onClick={() => setActiveTab('refuels')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'refuels' ? 'active-tab' : 'text-slate-400'}`}>
          <i className="fas fa-gas-pump text-lg"></i>
          <span className="text-[10px] font-bold">التفويلات</span>
        </button>
        <button onClick={() => setActiveTab('monthly')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'monthly' ? 'active-tab' : 'text-slate-400'}`}>
          <i className="fas fa-chart-bar text-lg"></i>
          <span className="text-[10px] font-bold">الشهر</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === 'profile' ? 'active-tab' : 'text-slate-400'}`}>
          <i className="fas fa-user text-lg"></i>
          <span className="text-[10px] font-bold">الحساب</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
