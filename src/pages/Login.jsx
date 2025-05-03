import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('로그인 실패: ' + error.message);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">관리자 로그인</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">로그인</button>
      </form>
    </div>
  );
}