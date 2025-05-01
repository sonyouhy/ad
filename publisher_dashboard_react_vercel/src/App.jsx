import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [apps, setApps] = useState([]);
  const [newAppName, setNewAppName] = useState('');

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const { data } = await supabase.from('apps').select('*');
    setApps(data || []);
  };

  const addApp = async () => {
    if (!newAppName.trim()) return;
    const { data } = await supabase.from('apps').insert({ name: newAppName }).select().single();
    setApps([...apps, data]);
    setNewAppName('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>광고 퍼블리셔 대시보드</h1>
      <input
        placeholder="앱 이름 입력"
        value={newAppName}
        onChange={(e) => setNewAppName(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={addApp}>앱 등록</button>
      <ul>
        {apps.map((app) => (
          <li key={app.id}>{app.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;