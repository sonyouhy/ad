import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function Dashboard({ onLogout }) {
  const [apps, setApps] = useState([]);
  const [adUnits, setAdUnits] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [newApp, setNewApp] = useState('');
  const [newAdUnit, setNewAdUnit] = useState({ app_id: '', name: '' });
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: a } = await supabase.from('apps').select('*');
    const { data: u } = await supabase.from('ad_units').select('*');
    const { data: r } = await supabase.from('revenues').select('*');
    setApps(a || []);
    setAdUnits(u || []);
    setRevenues(r || []);
  };

  const addApp = async () => {
    if (!newApp.trim()) return;
    const { data } = await supabase.from('apps').insert({ name: newApp }).select().single();
    setApps([data, ...apps]);
    setNewApp('');
  };

  const addAdUnit = async () => {
    if (!newAdUnit.name || !newAdUnit.app_id) return;
    const { data } = await supabase.from('ad_units').insert(newAdUnit).select().single();
    setAdUnits([data, ...adUnits]);
    setNewAdUnit({ app_id: '', name: '' });
  };

  const addTestRevenue = async (adUnitId) => {
    const { data } = await supabase.from('revenues').insert({ ad_unit_id: adUnitId, amount: 100 }).select().single();
    setRevenues([data, ...revenues]);
  };

  const downloadCSV = () => {
    const rows = [['App', 'Ad Unit', 'Amount', 'Date']];
    revenues.forEach(r => {
      const ad = adUnits.find(a => a.id === r.ad_unit_id);
      const app = apps.find(a => a.id === ad?.app_id);
      rows.push([app?.name, ad?.name, r.amount, new Date(r.created_at).toLocaleString()]);
    });
    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'revenues.csv';
    link.click();
  };

  const chartData = revenues.reduce((acc, r) => {
    const date = new Date(r.created_at).toLocaleDateString();
    const existing = acc.find(e => e.date === date);
    if (existing) existing.amount += r.amount;
    else acc.push({ date, amount: r.amount });
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  const filteredRevenues = filterDate
    ? revenues.filter(r => new Date(r.created_at).toLocaleDateString() === filterDate)
    : revenues;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded shadow space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">광고 플랫폼 관리자</h1>
        <button onClick={onLogout} className="text-red-500 hover:underline">로그아웃</button>
      </div>

      <section>
        <h2 className="font-semibold">앱 등록</h2>
        <div className="flex gap-2 mt-1">
          <input value={newApp} onChange={e => setNewApp(e.target.value)} className="border px-2 py-1 rounded w-full" placeholder="앱 이름" />
          <button onClick={addApp} className="bg-blue-500 text-white px-4 py-1 rounded">등록</button>
        </div>
      </section>

      <section>
        <h2 className="font-semibold">광고 단위 등록</h2>
        <div className="flex gap-2 mt-1">
          <select value={newAdUnit.app_id} onChange={e => setNewAdUnit({ ...newAdUnit, app_id: e.target.value })} className="border px-2 py-1 rounded w-1/3">
            <option value="">앱 선택</option>
            {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
          </select>
          <input value={newAdUnit.name} onChange={e => setNewAdUnit({ ...newAdUnit, name: e.target.value })} className="border px-2 py-1 rounded w-full" placeholder="광고 단위 이름" />
          <button onClick={addAdUnit} className="bg-blue-500 text-white px-4 py-1 rounded">등록</button>
        </div>
      </section>

      <section>
        <h2 className="font-semibold">수익 통계</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="font-semibold">수익 관리</h2>
        <div className="flex items-center gap-2 mt-1">
          <input type="text" placeholder="날짜(예: 2024. 5. 1.)" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border px-2 py-1 rounded" />
          <button onClick={() => setFilterDate('')} className="text-sm text-gray-500 underline">초기화</button>
          <button onClick={downloadCSV} className="ml-auto bg-green-500 text-white px-3 py-1 rounded">CSV 다운로드</button>
        </div>
        <ul className="mt-2 space-y-1">
          {filteredRevenues.map(r => {
            const ad = adUnits.find(a => a.id === r.ad_unit_id);
            const app = apps.find(a => a.id === ad?.app_id);
            return (
              <li key={r.id} className="text-sm">
                <strong>{app?.name} - {ad?.name}</strong>:
                {r.amount.toLocaleString()}원
                <span className="text-xs text-gray-500 ml-2">
                  ({new Date(r.created_at).toLocaleString()})
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-semibold">테스트 수익 발생</h2>
        <div className="flex gap-2 mt-1 flex-wrap">
          {adUnits.map(unit => (
            <button key={unit.id} onClick={() => addTestRevenue(unit.id)} className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
              {unit.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}