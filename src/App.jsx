import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/admin" /> : <Login />} />
        <Route path="/admin" element={session ? <Dashboard onLogout={() => supabase.auth.signOut()} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}