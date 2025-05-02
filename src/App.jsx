import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  return (
    <Routes>
      <Route path="/" element={session ? <Navigate to="/admin" /> : <Login />} />
      <Route path="/admin" element={session ? <Dashboard onLogout={() => supabase.auth.signOut()} /> : <Navigate to="/" />} />
    </Routes>
  );
}
