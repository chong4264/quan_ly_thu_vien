import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <AdminHeader />
        <Outlet />
      </div>
    </div>
  );
}
