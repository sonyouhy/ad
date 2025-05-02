import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [apps, setApps] = useState([]);
  const [newAppName, setNewAppName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const { data } = await supabase.from('apps').select('*').order('created_at', { ascending: false });
    setApps(data || []);
  };

  const addApp = async () => {
    const trimmed = newAppName.trim();
    if (!trimmed) return;
    const { data: existing } = await supabase.from('apps').select('name');
    if (existing.some(app => app.name === trimmed)) {
      alert('이미 존재하는 앱 이름입니다.');
      return;
    }
    const { data } = await supabase.from('apps').insert({ name: trimmed }).select().single();
    if (data) {
      setApps([data, ...apps]);
      setNewAppName('');
    }
  };

  const deleteApp = async (id) => {
    await supabase.from('apps').delete().eq('id', id);
    setApps(apps.filter(app => app.id !== id));
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4 mt-10">
      <h1 className="text-2xl font-bold text-center">광고 퍼블리셔 대시보드</h1>

      <div className="flex gap-2">
        <input
          className="border border-gray-300 px-2 py-1 rounded flex-1"
          placeholder="앱 이름 입력"
          value={newAppName}
          onChange={(e) => setNewAppName(e.target.value)}
        />
        <button
          onClick={addApp}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          앱 등록
        </button>
      </div>

      <input
        className="w-full border px-2 py-1 rounded"
        placeholder="앱 이름 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul className="space-y-2">
        {filteredApps.map((app) => (
          <li key={app.id} className="flex justify-between items-center border-b pb-1">
            <div>
              <strong>{app.name}</strong>
              <span className="text-sm text-gray-500 ml-2">
                {new Date(app.created_at).toLocaleDateString()}
              </span>
            </div>
            <button
              onClick={() => deleteApp(app.id)}
              className="text-red-500 hover:underline"
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;