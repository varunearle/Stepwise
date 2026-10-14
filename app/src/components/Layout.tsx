import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Icon } from './ui';

const STUDENT_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/practice', label: 'Practice', icon: 'practice' },
  { to: '/progress', label: 'Progress', icon: 'progress' },
  { to: '/model', label: 'Model', icon: 'model' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];
const TEACHER_NAV = [
  { to: '/class', label: 'Class', icon: 'class' },
  { to: '/model', label: 'Model', icon: 'model' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Layout() {
  const { session, data, signOut } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const teacher = session?.role === 'teacher';
  const items = teacher ? TEACHER_NAV : STUDENT_NAV;
  const name = teacher ? data.teacherName : data.studentName;

  const sidebar = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="border-b border-line px-5 py-5">
          <div className="font-serif text-[22px] font-semibold leading-7 tracking-tight">Stepwise</div>
          <div className="text-[12px] text-muted">Data Structures · adaptive practice</div>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded px-3 py-2 transition-colors ${
                  isActive ? 'bg-teal text-white' : 'text-muted hover:bg-sunk hover:text-ink'
                }`}
            >
              <Icon name={it.icon} />
              <span className="flex-1">{it.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div>
      <div className="flex gap-3 px-5 pb-3 text-[12px]">
        <NavLink to="/privacy" className="text-muted hover:text-ink">Privacy</NavLink>
        <NavLink to="/terms" className="text-muted hover:text-ink">Terms</NavLink>
      </div>
      <div className="border-t border-line bg-card p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-soft font-mono text-[12px] font-semibold text-teal">
            {name.split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{name}</div>
            <div className="text-[12px] text-muted">{teacher ? 'Teacher' : 'Student'}</div>
          </div>
          <button
            type="button"
            onClick={() => { signOut(); nav('/'); }}
            className="rounded p-1.5 text-muted hover:bg-sunk hover:text-ink"
            title="Sign out"
            aria-label="Sign out"
          >
            <Icon name="out" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] border-r border-line bg-[#F5F2EC] lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-4 lg:hidden">
        <span className="font-serif text-lg font-semibold">Stepwise</span>
        <button type="button" onClick={() => setOpen(!open)} className="rounded p-2 hover:bg-sunk" aria-label="Menu">
          <Icon name="menu" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink/20" />
          <aside className="absolute inset-y-0 left-0 w-[260px] border-r border-line bg-[#F5F2EC]" onClick={(e) => e.stopPropagation()}>{sidebar}</aside>
        </div>
      )}
      <main className="lg:pl-[232px]">
        <div className="mx-auto max-w-[1180px] px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
