import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { StoreProvider, useStore } from './lib/store';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import ClassView from './pages/ClassView';
import Model from './pages/Model';
import Settings from './pages/Settings';
import { Privacy, Terms } from './pages/Legal';

function Guard({ role, children }: { role?: 'student' | 'teacher'; children: ReactNode }) {
  const { session } = useStore();
  if (!session) return <Navigate to="/" replace />;
  if (role && session.role !== role) return <Navigate to={session.role === 'teacher' ? '/class' : '/dashboard'} replace />;
  return <>{children}</>;
}

function Home() {
  const { session } = useStore();
  if (session) return <Navigate to={session.role === 'teacher' ? '/class' : '/dashboard'} replace />;
  return <SignIn />;
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route element={<Guard><Layout /></Guard>}>
            <Route path="/dashboard" element={<Guard role="student"><Dashboard /></Guard>} />
            <Route path="/practice" element={<Guard role="student"><Practice /></Guard>} />
            <Route path="/practice/:topic" element={<Guard role="student"><Practice /></Guard>} />
            <Route path="/progress" element={<Guard role="student"><Progress /></Guard>} />
            <Route path="/progress/:topic" element={<Guard role="student"><Progress /></Guard>} />
            <Route path="/class" element={<Guard role="teacher"><ClassView /></Guard>} />
            <Route path="/model" element={<Model />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
