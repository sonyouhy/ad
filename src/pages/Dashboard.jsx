import { useEffect, useState } from 'react';
import { supabase } from '../auth';

export default function Dashboard({ onLogout }) {
  const [apps, setApps] = useState([]);
  const [adUnits, setAdUnits] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [newApp, setNewApp] = useState('');
  const [newAdUnit, setNewAdUnit] = useState({ app_id: '', name: '' });

  const loadData = async () => {
    const { data: a } = await supabase.from('apps').select('*').order('id', { ascending: false });
    const { data: u } = await supabase.from('ad_units').select('*');
    const { data: r } = await supabase.from('revenues').select('*');
    setApps(a || []); setAdUnits(u || []); setRevenues(r || []);
  };

  useEffect(() => { loadData(); }, []);

  const addApp = async () => {
    if (!newApp.trim()) return;
    const { data } = await supabase.from('apps').insert({ name: newApp }).select().single();
    setApps([data, ...apps]); setNewApp('');
  };

  const addAdUnit = async () => {
    if (!newAdUnit.name || !newAdUnit.app_id) return;
    const { data } = await supabase.from('ad_units').insert(newAdUnit).select().single();
    setAdUnits([data, ...adUnits]); setNewAdUnit({ app_id: '', name: '' });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white rounded shadow space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">광고 플랫폼 관리자</h1>
        <button onClick={onLogout} className="text-red-500 hover:underline">로그아웃</button>
      </div>

      <div>
        <h2 className="font-semibold">앱 등록</h2>
        <div className="flex gap-2 mt-1">
          <input value={newApp} onChange={e => setNewApp(e.target.value)} className="border px-2 py-1 rounded w-full" placeholder="앱 이름" />
          <button onClick={addApp} className="bg-blue-500 text-white px-4 py-1 rounded">등록</button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold">광고 단위 등록</h2>
        <div className="flex gap-2 mt-1">
          <select value={newAdUnit.app_id} onChange={e => setNewAdUnit({ ...newAdUnit, app_id: e.target.value })} className="border px-2 py-1 rounded w-1/3">
            <option value="">앱 선택</option>
            {apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
          </select>
          <input value={newAdUnit.name} onChange={e => setNewAdUnit({ ...newAdUnit, name: e.target.value })} className="border px-2 py-1 rounded w-full" placeholder="광고 단위 이름" />
          <button onClick={addAdUnit} className="bg-blue-500 text-white px-4 py-1 rounded">등록</button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold">수익 정보</h2>
        <ul className="mt-2 space-y-1">
          {revenues.map(r => {
            const ad = adUnits.find(a => a.id === r.ad_unit_id);
            const app = apps.find(a => a.id === ad?.app_id);
            return (
              <li key={r.id} className="text-sm">
                <strong>{app?.name} - {ad?.name}</strong>: {r.amount.toLocaleString()}원
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}