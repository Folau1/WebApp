import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-telegram-bg">
      <Header />
      <main className="pb-20">
        <Outlet />
      </main>
    </div>
  );
}
