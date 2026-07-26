import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import './shell.css';

export function AppShell() {
  return (
    <div className="shell">
      <div className="shell__content">
        <Outlet />
      </div>
      <NavBar />
    </div>
  );
}

export function PlainShell() {
  return (
    <div className="shell shell--plain">
      <div className="shell__content shell__content--full">
        <Outlet />
      </div>
    </div>
  );
}
