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

    // 중복 검사
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
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>광고 퍼블리셔 대시보드</h1>
      
      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="앱 이름 입력"
          value={newAppName}
          onChange={(e) => setNewAppName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={addApp}>앱 등록</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="앱 이름 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul>
        {filteredApps.map((app) => (
          <li key={app.id} style={{ marginBottom: 5 }}>
            <strong>{app.name}</strong>
            <span style={{ marginLeft: 10, color: 'gray' }}>
              ({new Date(app.created_at).toLocaleDateString()})
            </span>
            <button
              onClick={() => deleteApp(app.id)}
              style={{ marginLeft: 10, color: 'red' }}
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
