import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const UserLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      <Outlet />
    </main>
    <Footer />
  </div>
);
