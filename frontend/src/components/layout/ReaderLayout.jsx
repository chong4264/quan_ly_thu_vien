import { Outlet } from 'react-router-dom';
import ReaderHeader from './ReaderHeader';
import ReaderFooter from './ReaderFooter';

export default function ReaderLayout() {
  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      <ReaderHeader />
      <Outlet />
      <ReaderFooter />
    </div>
  );
}
